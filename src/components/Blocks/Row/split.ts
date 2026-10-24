import { v4 as uuid } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import { RowBlockData, deriveGridTemplate } from './normalize';

type FormData = {
  blocks: Record<string, any>;
  blocks_layout: { items: string[] };
};

export interface SplitResult extends FormData {
  newRowId: string;
}

interface SourceLocation {
  rowId: string;
  colId: string;
}

const isRowType = (b: any) =>
  !!b &&
  (b['@type'] === 'row' ||
    b['@type'] === 'columnsBlock' ||
    b['@type'] === 'gridBlock');

const cleanInnerBlockData = (blockData: any) => {
  if (!blockData) return blockData;
  if (
    !blockData.style_name &&
    !blockData.styles?.style_name &&
    !blockData.styles?.customClass
  ) {
    return blockData;
  }
  const cleaned = { ...blockData };
  delete cleaned.style_name;
  if (cleaned.styles) {
    cleaned.styles = { ...cleaned.styles };
    delete cleaned.styles.style_name;
    delete cleaned.styles.customClass;
  }
  return cleaned;
};

const makeColumn = (blockId: string, blockData: any) => {
  const id = uuid();
  return {
    id,
    col: {
      '@type': 'rowColumn',
      id,
      width: '1fr',
      blocks: { [blockId]: cleanInnerBlockData(blockData) },
      blocks_layout: { items: [blockId] },
    },
  };
};

/**
 * Searches the form data tree (root blocks and nested row columns) for a block,
 * removes it from its original position and returns the block data, the
 * updated (deep-cloned) form data and where the block came from.
 */
export function extractBlockFromFormData(
  formData: FormData,
  blockId: string,
): {
  blockData: any | null;
  newFormData: FormData;
  source: SourceLocation | null;
} {
  if (!formData || !formData.blocks || !formData.blocks_layout) {
    return { blockData: null, newFormData: formData, source: null };
  }

  const nextBlocks = cloneDeep(formData.blocks);
  const nextLayoutItems = [...(formData.blocks_layout.items || [])];

  // 1. Root level
  if (nextBlocks[blockId]) {
    const blockData = nextBlocks[blockId];
    delete nextBlocks[blockId];
    const idx = nextLayoutItems.indexOf(blockId);
    if (idx > -1) nextLayoutItems.splice(idx, 1);
    return {
      blockData,
      newFormData: {
        ...formData,
        blocks: nextBlocks,
        blocks_layout: { items: nextLayoutItems },
      },
      source: null,
    };
  }

  // 2. Inside row columns
  for (const rId of Object.keys(nextBlocks)) {
    const rBlock = nextBlocks[rId];
    if (!isRowType(rBlock) || !rBlock.blocks) continue;
    for (const cId of Object.keys(rBlock.blocks)) {
      const col = rBlock.blocks[cId];
      if (col?.blocks?.[blockId]) {
        const blockData = col.blocks[blockId];
        const newColBlocks = { ...col.blocks };
        delete newColBlocks[blockId];
        const newCol = {
          ...col,
          blocks: newColBlocks,
          blocks_layout: {
            items: (col.blocks_layout?.items || []).filter(
              (id: string) => id !== blockId,
            ),
          },
        };
        nextBlocks[rId] = {
          ...rBlock,
          blocks: {
            ...rBlock.blocks,
            [cId]: newCol,
          },
        };
        return {
          blockData,
          newFormData: {
            ...formData,
            blocks: nextBlocks,
            blocks_layout: { items: nextLayoutItems },
          },
          source: { rowId: rId, colId: cId },
        };
      }
    }
  }

  return {
    blockData: null,
    newFormData: {
      ...formData,
      blocks: nextBlocks,
      blocks_layout: { items: nextLayoutItems },
    },
    source: null,
  };
}

/**
 * Mosaic behaviour: when a block is dragged out of a column and that column
 * is left empty, the column is removed (as long as the row keeps at least one).
 */
function removeEmptySourceColumn(
  blocks: Record<string, any>,
  source: SourceLocation | null,
) {
  if (!source) return;
  const row = blocks[source.rowId];
  if (!row?.blocks) return;
  const col = row.blocks[source.colId];
  if (!col || (col.blocks_layout?.items || []).length > 0) return;
  const items: string[] = row.blocks_layout?.items || [];
  if (items.length <= 1) return;

  const newItems = items.filter((i) => i !== source.colId);
  const newCols = { ...row.blocks };
  delete newCols[source.colId];
  blocks[source.rowId] = {
    ...row,
    blocks: newCols,
    blocks_layout: { items: newItems },
    gridTemplate: deriveGridTemplate({ items: newItems }, newCols),
    layoutPreset: undefined,
  };
}

/**
 * Drops `sourceBlockId` to the left/right of the root-level `targetBlockId`.
 * - target is a regular block -> both are wrapped in a new 2-column row
 * - target is a row -> a new column is prepended/appended to it
 */
export function splitBlocksIntoRow(
  formData: FormData,
  targetBlockId: string,
  sourceBlockId: string,
  position: 'left' | 'right' = 'right',
): SplitResult {
  const unchanged = {
    blocks: formData?.blocks,
    blocks_layout: formData?.blocks_layout,
    newRowId: targetBlockId,
  };
  if (!formData?.blocks || targetBlockId === sourceBlockId) return unchanged;

  const {
    blockData: sourceBlock,
    newFormData,
    source,
  } = extractBlockFromFormData(formData, sourceBlockId);
  if (!sourceBlock) return unchanged;

  const nextBlocks = newFormData.blocks;
  const nextLayoutItems = [...newFormData.blocks_layout.items];
  const targetBlock = nextBlocks[targetBlockId];
  if (!targetBlock) return unchanged;

  // Case A: target is already a row -> add a column at the edge
  if (isRowType(targetBlock)) {
    const { id: newColId, col } = makeColumn(sourceBlockId, sourceBlock);
    const colIds = [...(targetBlock.blocks_layout?.items || [])];
    const colBlocks: Record<string, any> = { ...(targetBlock.blocks || {}) };
    colBlocks[newColId] = col;
    if (position === 'left') colIds.unshift(newColId);
    else colIds.push(newColId);
    colIds.forEach((cid) => {
      if (colBlocks[cid]) colBlocks[cid] = { ...colBlocks[cid], width: '1fr' };
    });

    const newCount = colIds.length;
    const preset =
      newCount === 2
        ? '2-col-equal'
        : newCount === 3
          ? '3-col-equal'
          : newCount === 4
            ? '4-col-equal'
            : 'custom';

    nextBlocks[targetBlockId] = {
      ...targetBlock,
      '@type': 'row',
      blocks_layout: { items: colIds },
      blocks: colBlocks,
      gridTemplate: deriveGridTemplate({ items: colIds }, colBlocks),
      layoutPreset: preset,
    };
    // Only remove empty source column if it came from a different row
    if (source && source.rowId !== targetBlockId) {
      removeEmptySourceColumn(nextBlocks, source);
    }

    return {
      blocks: nextBlocks,
      blocks_layout: { items: nextLayoutItems },
      newRowId: targetBlockId,
    };
  }

  // Case A2: source is already a row and target is a normal block -> add target into source row
  if (isRowType(sourceBlock) && !isRowType(targetBlock)) {
    const { id: newColId, col } = makeColumn(targetBlockId, targetBlock);
    const colIds = [...(sourceBlock.blocks_layout?.items || [])];
    const colBlocks: Record<string, any> = { ...(sourceBlock.blocks || {}) };
    colBlocks[newColId] = col;
    if (position === 'left') colIds.push(newColId);
    else colIds.unshift(newColId);
    colIds.forEach((cid) => {
      if (colBlocks[cid]) colBlocks[cid] = { ...colBlocks[cid], width: '1fr' };
    });

    const targetIdx = nextLayoutItems.indexOf(targetBlockId);
    delete nextBlocks[targetBlockId];

    const newCount = colIds.length;
    const preset =
      newCount === 2
        ? '2-col-equal'
        : newCount === 3
          ? '3-col-equal'
          : newCount === 4
            ? '4-col-equal'
            : 'custom';

    nextBlocks[sourceBlockId] = {
      ...sourceBlock,
      '@type': 'row',
      blocks_layout: { items: colIds },
      blocks: colBlocks,
      gridTemplate: deriveGridTemplate({ items: colIds }, colBlocks),
      layoutPreset: preset,
    };

    if (targetIdx > -1) {
      nextLayoutItems.splice(targetIdx, 1, sourceBlockId);
    } else {
      nextLayoutItems.push(sourceBlockId);
    }

    return {
      blocks: nextBlocks,
      blocks_layout: { items: nextLayoutItems },
      newRowId: sourceBlockId,
    };
  }

  // Case B: wrap target + source in a new row
  const targetIndex = nextLayoutItems.indexOf(targetBlockId);
  delete nextBlocks[targetBlockId];

  const left =
    position === 'left'
      ? makeColumn(sourceBlockId, sourceBlock)
      : makeColumn(targetBlockId, targetBlock);
  const right =
    position === 'left'
      ? makeColumn(targetBlockId, targetBlock)
      : makeColumn(sourceBlockId, sourceBlock);

  const newRowId = uuid();
  const newRow: RowBlockData = {
    '@type': 'row',
    blockWidth: targetBlock.blockWidth || 'default',
    gridGap: '1.5rem',
    gridTemplate: '1fr 1fr',
    layoutPreset: '2-col-equal',
    blocks_layout: { items: [left.id, right.id] },
    blocks: {
      [left.id]: left.col as any,
      [right.id]: right.col as any,
    },
  };
  nextBlocks[newRowId] = newRow;

  if (targetIndex > -1) nextLayoutItems.splice(targetIndex, 1, newRowId);
  else nextLayoutItems.push(newRowId);

  removeEmptySourceColumn(nextBlocks, source);

  return {
    blocks: nextBlocks,
    blocks_layout: { items: nextLayoutItems },
    newRowId,
  };
}

/**
 * Moves any block (root or nested) to the root level above/below `targetBlockId`.
 * Also works as a plain reorder inside a single column's form data.
 */
export function moveBlockToRoot(
  formData: FormData,
  sourceBlockId: string,
  targetBlockId: string,
  position: 'top' | 'bottom' = 'bottom',
): FormData {
  if (!formData?.blocks || sourceBlockId === targetBlockId) return formData;

  const {
    blockData: sourceBlock,
    newFormData,
    source,
  } = extractBlockFromFormData(formData, sourceBlockId);
  if (!sourceBlock) return formData;

  const nextBlocks = newFormData.blocks;
  const nextLayoutItems = [...newFormData.blocks_layout.items];
  nextBlocks[sourceBlockId] = sourceBlock;

  const targetIdx = nextLayoutItems.indexOf(targetBlockId);
  if (targetIdx > -1) {
    nextLayoutItems.splice(
      position === 'top' ? targetIdx : targetIdx + 1,
      0,
      sourceBlockId,
    );
  } else {
    nextLayoutItems.push(sourceBlockId);
  }

  removeEmptySourceColumn(nextBlocks, source);

  return { blocks: nextBlocks, blocks_layout: { items: nextLayoutItems } };
}

/**
 * Moves any block into a column of a row, before `beforeBlockId`
 * (or at the end of the column when `beforeBlockId` is null).
 */
export function moveBlockIntoColumn(
  formData: FormData,
  sourceBlockId: string,
  targetRowId: string,
  targetColId: string,
  beforeBlockId: string | null = null,
): FormData {
  if (beforeBlockId === sourceBlockId) return formData;

  const {
    blockData: sourceBlock,
    newFormData,
    source,
  } = extractBlockFromFormData(formData, sourceBlockId);
  if (!sourceBlock) return formData;

  const nextBlocks = { ...(newFormData.blocks || {}) };
  const row = nextBlocks[targetRowId];
  const targetCol = row?.blocks?.[targetColId];
  if (!targetCol) return formData;

  const newTargetBlocks = {
    ...(targetCol.blocks || {}),
    [sourceBlockId]: cleanInnerBlockData(sourceBlock),
  };
  const items: string[] = [...(targetCol.blocks_layout?.items || [])];
  const beforeIdx = beforeBlockId ? items.indexOf(beforeBlockId) : -1;
  if (beforeIdx > -1) items.splice(beforeIdx, 0, sourceBlockId);
  else items.push(sourceBlockId);

  nextBlocks[targetRowId] = {
    ...row,
    blocks: {
      ...row.blocks,
      [targetColId]: {
        ...targetCol,
        blocks: newTargetBlocks,
        blocks_layout: { items },
      },
    },
  };

  // Only remove empty source column if it came from a different row
  if (source && source.rowId !== targetRowId) {
    removeEmptySourceColumn(nextBlocks, source);
  }

  return {
    ...formData,
    blocks: nextBlocks,
    blocks_layout: newFormData.blocks_layout,
  };
}

/**
 * Inserts a new column containing `sourceBlockId` to the left/right of
 * an existing column `refColId` inside row `targetRowId`.
 */
export function insertBlockAsNewColumn(
  formData: FormData,
  sourceBlockId: string,
  targetRowId: string,
  refColId: string,
  side: 'before' | 'after',
): FormData {
  const {
    blockData: sourceBlock,
    newFormData,
    source,
  } = extractBlockFromFormData(formData, sourceBlockId);
  if (!sourceBlock) return formData;

  const nextBlocks = { ...(newFormData.blocks || {}) };
  const row = nextBlocks[targetRowId];
  if (!row?.blocks) return formData;

  const { id: newColId, col } = makeColumn(sourceBlockId, sourceBlock);
  const colIds: string[] = [...(row.blocks_layout?.items || [])];
  const refIdx = colIds.indexOf(refColId);
  const insertAt =
    refIdx < 0 ? colIds.length : side === 'before' ? refIdx : refIdx + 1;
  colIds.splice(insertAt, 0, newColId);

  const colBlocks: Record<string, any> = { ...row.blocks, [newColId]: col };
  colIds.forEach((cid) => {
    if (colBlocks[cid]) colBlocks[cid] = { ...colBlocks[cid], width: '1fr' };
  });

  const newCount = colIds.length;
  const preset =
    newCount === 2
      ? '2-col-equal'
      : newCount === 3
        ? '3-col-equal'
        : newCount === 4
          ? '4-col-equal'
          : 'custom';

  nextBlocks[targetRowId] = {
    ...row,
    blocks: colBlocks,
    blocks_layout: { items: colIds },
    gridTemplate: deriveGridTemplate({ items: colIds }, colBlocks),
    layoutPreset: preset,
  };

  // Only remove empty source column if it came from a different row
  if (source && source.rowId !== targetRowId) {
    removeEmptySourceColumn(nextBlocks, source);
  }

  return {
    ...formData,
    blocks: nextBlocks,
    blocks_layout: newFormData.blocks_layout,
  };
}
