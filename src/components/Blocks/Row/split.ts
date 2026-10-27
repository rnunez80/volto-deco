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

  // 2. Inside row columns (checking both .blocks and .data.blocks)
  for (const rId of Object.keys(nextBlocks)) {
    const rBlock = nextBlocks[rId];
    if (!rBlock) continue;

    const colContainers =
      rBlock.blocks || rBlock.data?.blocks || rBlock.columnsBlocks;
    if (colContainers && typeof colContainers === 'object') {
      for (const cId of Object.keys(colContainers)) {
        const col = colContainers[cId];
        if (!col) continue;

        const innerBlocks = col.blocks || col.data?.blocks;
        if (innerBlocks && innerBlocks[blockId]) {
          const blockData = innerBlocks[blockId];
          const newColBlocks = { ...innerBlocks };
          delete newColBlocks[blockId];

          const colLayout =
            col.blocks_layout || col.data?.blocks_layout || { items: [] };
          const newColItems = (colLayout.items || []).filter(
            (id: string) => id !== blockId,
          );

          const updatedCol = {
            ...col,
            blocks: newColBlocks,
            blocks_layout: { items: newColItems },
          };
          if (col.data && typeof col.data === 'object') {
            updatedCol.data = {
              ...col.data,
              blocks: newColBlocks,
              blocks_layout: { items: newColItems },
            };
          }

          const updatedCols = {
            ...colContainers,
            [cId]: updatedCol,
          };

          const updatedRow = {
            ...rBlock,
            blocks: updatedCols,
          };
          if (rBlock.data && typeof rBlock.data === 'object') {
            updatedRow.data = {
              ...rBlock.data,
              blocks: updatedCols,
            };
          }

          nextBlocks[rId] = updatedRow;

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
 * If all columns in the source row become empty, the row is removed from layout.
 */
function removeEmptySourceColumn(
  blocks: Record<string, any>,
  source: SourceLocation | null,
  layoutItems?: string[],
) {
  if (!source) return;
  const row = blocks[source.rowId];
  if (!row) return;

  const colContainers =
    row.blocks || row.data?.blocks || row.columnsBlocks;
  if (!colContainers) return;

  const col = colContainers[source.colId];
  if (!col) return;

  const colItems: string[] =
    col.blocks_layout?.items || col.data?.blocks_layout?.items || [];
  if (colItems.length > 0) return;

  // The source column is now empty.
  const rowItems: string[] =
    row.blocks_layout?.items ||
    row.data?.blocks_layout?.items ||
    Object.keys(colContainers);

  // Check if all columns in this row are now empty
  let totalBlocks = 0;
  rowItems.forEach((cid) => {
    const c = colContainers[cid];
    const items =
      c?.blocks_layout?.items || c?.data?.blocks_layout?.items || [];
    totalBlocks += items.length;
  });

  if (totalBlocks === 0 && layoutItems) {
    // Entire row is empty, remove the row from root layout
    delete blocks[source.rowId];
    const rIdx = layoutItems.indexOf(source.rowId);
    if (rIdx > -1) layoutItems.splice(rIdx, 1);
    return;
  }

  if (rowItems.length <= 1) return;

  const newItems = rowItems.filter((i) => i !== source.colId);
  const newCols = { ...colContainers };
  delete newCols[source.colId];

  const updatedRow = {
    ...row,
    blocks: newCols,
    blocks_layout: { items: newItems },
    gridTemplate: deriveGridTemplate({ items: newItems }, newCols),
    layoutPreset: undefined,
  };
  if (row.data && typeof row.data === 'object') {
    updatedRow.data = {
      ...row.data,
      blocks: newCols,
      blocks_layout: { items: newItems },
    };
  }
  blocks[source.rowId] = updatedRow;
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
      removeEmptySourceColumn(nextBlocks, source, nextLayoutItems);
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

  removeEmptySourceColumn(nextBlocks, source, nextLayoutItems);

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

  removeEmptySourceColumn(nextBlocks, source, nextLayoutItems);

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
  const nextLayoutItems = [...(newFormData.blocks_layout?.items || [])];
  const row = nextBlocks[targetRowId];
  if (!row) return formData;

  const colContainers =
    row.blocks || row.data?.blocks || row.columnsBlocks;
  const targetCol = colContainers?.[targetColId];
  if (!targetCol) return formData;

  const targetColBlocks = targetCol.blocks || targetCol.data?.blocks || {};
  const targetColLayout =
    targetCol.blocks_layout || targetCol.data?.blocks_layout || { items: [] };

  const newTargetBlocks = {
    ...targetColBlocks,
    [sourceBlockId]: cleanInnerBlockData(sourceBlock),
  };
  const items: string[] = [...(targetColLayout.items || [])];
  const beforeIdx = beforeBlockId ? items.indexOf(beforeBlockId) : -1;
  if (beforeIdx > -1) items.splice(beforeIdx, 0, sourceBlockId);
  else items.push(sourceBlockId);

  const updatedTargetCol = {
    ...targetCol,
    blocks: newTargetBlocks,
    blocks_layout: { items },
  };
  if (targetCol.data && typeof targetCol.data === 'object') {
    updatedTargetCol.data = {
      ...targetCol.data,
      blocks: newTargetBlocks,
      blocks_layout: { items },
    };
  }

  const updatedCols = {
    ...colContainers,
    [targetColId]: updatedTargetCol,
  };

  const updatedRow = {
    ...row,
    blocks: updatedCols,
  };
  if (row.data && typeof row.data === 'object') {
    updatedRow.data = {
      ...row.data,
      blocks: updatedCols,
    };
  }
  nextBlocks[targetRowId] = updatedRow;

  // Remove empty source column if it came from a different row
  if (source && source.rowId !== targetRowId) {
    removeEmptySourceColumn(nextBlocks, source, nextLayoutItems);
  }

  return {
    ...formData,
    blocks: nextBlocks,
    blocks_layout: { items: nextLayoutItems },
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
  const nextLayoutItems = [...(newFormData.blocks_layout?.items || [])];
  const row = nextBlocks[targetRowId];
  if (!row) return formData;

  const colContainers =
    row.blocks || row.data?.blocks || row.columnsBlocks;
  if (!colContainers) return formData;

  const { id: newColId, col } = makeColumn(sourceBlockId, sourceBlock);
  const rowLayout =
    row.blocks_layout || row.data?.blocks_layout || { items: [] };
  const colIds: string[] = [...(rowLayout.items || Object.keys(colContainers))];
  const refIdx = colIds.indexOf(refColId);
  const insertAt =
    refIdx < 0 ? colIds.length : side === 'before' ? refIdx : refIdx + 1;
  colIds.splice(insertAt, 0, newColId);

  const colBlocks: Record<string, any> = { ...colContainers, [newColId]: col };
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

  const updatedRow = {
    ...row,
    blocks: colBlocks,
    blocks_layout: { items: colIds },
    gridTemplate: deriveGridTemplate({ items: colIds }, colBlocks),
    layoutPreset: preset,
  };
  if (row.data && typeof row.data === 'object') {
    updatedRow.data = {
      ...row.data,
      blocks: colBlocks,
      blocks_layout: { items: colIds },
    };
  }
  nextBlocks[targetRowId] = updatedRow;

  // Remove empty source column if it came from a different row
  if (source && source.rowId !== targetRowId) {
    removeEmptySourceColumn(nextBlocks, source, nextLayoutItems);
  }

  return {
    ...formData,
    blocks: nextBlocks,
    blocks_layout: { items: nextLayoutItems },
  };
}
