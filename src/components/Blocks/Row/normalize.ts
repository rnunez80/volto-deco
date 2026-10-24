/**
 * Multi-Column Row Normalization & Migration Engine
 * Converts legacy EEA "columnsBlock" and Volto core "gridBlock" into modern @type: 'row'
 */

export interface RowColumnData {
  '@type': 'rowColumn';
  id?: string;
  width?: string;
  blocks: Record<string, any>;
  blocks_layout: {
    items: string[];
  };
  [key: string]: any;
}

export interface RowBlockData {
  '@type': 'row';
  blockWidth?: string;
  gridGap?: string;
  gridTemplate?: string;
  headline?: string;
  blocks_layout: {
    items: string[];
  };
  blocks: Record<string, RowColumnData>;
  [key: string]: any;
}

/**
 * Check if a block data object is a legacy columns or grid block.
 */
export function isLegacyContainerBlock(blockData: any): boolean {
  if (!blockData || typeof blockData !== 'object') return false;
  const type = blockData['@type'];
  return type === 'columnsBlock' || type === 'gridBlock';
}

/**
 * Derives a valid CSS grid-template-columns string from column widths or items count.
 */
export function deriveGridTemplate(
  columnsLayout: { items?: string[] },
  columnsBlocks?: Record<string, any>,
): string {
  const items = columnsLayout?.items || [];
  if (items.length === 0) return '1fr';

  const widths = items.map((colId) => {
    const col = columnsBlocks?.[colId];
    if (col?.width) {
      return col.width;
    }
    return '1fr';
  });

  return widths.join(' ');
}

/**
 * Normalizes an EEA columnsBlock (@eeacms/volto-columns-block) data structure to @type: 'row'.
 */
export function normalizeColumnsBlock(data: any): RowBlockData {
  if (!data) {
    return {
      '@type': 'row',
      blockWidth: 'default',
      blocks_layout: { items: [] },
      blocks: {},
    };
  }

  // EEA stores columns either in data.data or top-level data
  const rawData = data.data && typeof data.data === 'object' ? data.data : data;
  const columnIds: string[] =
    rawData.blocks_layout?.items || data.blocks_layout?.items || [];
  const rawBlocks: Record<string, any> = rawData.blocks || data.blocks || {};

  const normalizedColumns: Record<string, RowColumnData> = {};
  const validColumnIds: string[] = [];

  columnIds.forEach((colId, index) => {
    const rawCol = rawBlocks[colId] || {};
    const innerBlocks = rawCol.blocks || {};
    const innerLayout = rawCol.blocks_layout || { items: [] };

    // Recursively normalize any nested blocks within this column
    const normalizedInner = normalizeContentBlocks(innerBlocks, innerLayout);

    // Calculate column width ratio
    let width = '1fr';
    if (rawCol.grid_size && typeof rawCol.grid_size === 'number') {
      width = `${rawCol.grid_size}fr`;
    } else if (rawCol.width && typeof rawCol.width === 'string') {
      width = rawCol.width;
    }

    normalizedColumns[colId] = {
      ...rawCol,
      '@type': 'rowColumn',
      id: colId,
      width,
      blocks: normalizedInner.blocks,
      blocks_layout: normalizedInner.blocks_layout,
    };
    validColumnIds.push(colId);
  });

  // If no columns existed, create at least one empty column
  if (validColumnIds.length === 0) {
    const defaultColId = 'col-default';
    normalizedColumns[defaultColId] = {
      '@type': 'rowColumn',
      id: defaultColId,
      width: '1fr',
      blocks: {},
      blocks_layout: { items: [] },
    };
    validColumnIds.push(defaultColId);
  }

  const {
    data: _discardData,
    grid_size: _discardGridSize,
    ...restProperties
  } = data;

  return {
    ...restProperties,
    '@type': 'row',
    blockWidth: data.blockWidth || 'default',
    gridGap: data.gridGap || '1.5rem',
    gridTemplate: deriveGridTemplate(
      { items: validColumnIds },
      normalizedColumns,
    ),
    blocks_layout: { items: validColumnIds },
    blocks: normalizedColumns,
  };
}

/**
 * Normalizes a Volto core gridBlock (@plone/volto/components/manage/Blocks/Grid) to @type: 'row'.
 */
export function normalizeGridBlock(data: any): RowBlockData {
  if (!data) {
    return {
      '@type': 'row',
      blockWidth: 'default',
      blocks_layout: { items: [] },
      blocks: {},
    };
  }

  const itemIds: string[] = data.blocks_layout?.items || [];
  const rawBlocks: Record<string, any> = data.blocks || {};

  const normalizedColumns: Record<string, RowColumnData> = {};
  const validColumnIds: string[] = [];

  itemIds.forEach((itemId, idx) => {
    const childBlock = rawBlocks[itemId];
    if (!childBlock) return;

    // In gridBlock, each item is a block directly (e.g. teaser, image).
    // We wrap it in a rowColumn container so arbitrary blocks can reside in the column.
    const colId = `col-${itemId}`;
    normalizedColumns[colId] = {
      '@type': 'rowColumn',
      id: colId,
      width: '1fr',
      blocks: {
        [itemId]: childBlock,
      },
      blocks_layout: {
        items: [itemId],
      },
    };
    validColumnIds.push(colId);
  });

  // If no items existed, create one empty column
  if (validColumnIds.length === 0) {
    const defaultColId = 'col-default';
    normalizedColumns[defaultColId] = {
      '@type': 'rowColumn',
      id: defaultColId,
      width: '1fr',
      blocks: {},
      blocks_layout: { items: [] },
    };
    validColumnIds.push(defaultColId);
  }

  return {
    ...data,
    '@type': 'row',
    headline: data.headline,
    blockWidth: data.blockWidth || 'default',
    gridGap: data.gridGap || '1.5rem',
    gridTemplate: deriveGridTemplate(
      { items: validColumnIds },
      normalizedColumns,
    ),
    blocks_layout: { items: validColumnIds },
    blocks: normalizedColumns,
  };
}

/**
 * Normalizes any row or legacy columns/grid block into a strictly formatted @type: 'row' block.
 */
export function normalizeRowData(data: any): RowBlockData {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const type = data['@type'];
  if (type === 'columnsBlock') {
    return normalizeColumnsBlock(data);
  }
  if (type === 'gridBlock') {
    return normalizeGridBlock(data);
  }

  if (type === 'row') {
    const columnIds: string[] = data.blocks_layout?.items || [];
    const columns: Record<string, any> = data.blocks || {};
    const normalizedCols: Record<string, RowColumnData> = {};

    columnIds.forEach((colId) => {
      const col = columns[colId] || {};
      const innerNormalized = normalizeContentBlocks(
        col.blocks || {},
        col.blocks_layout || { items: [] },
      );
      normalizedCols[colId] = {
        ...col,
        '@type': 'rowColumn',
        id: colId,
        width: col.width || '1fr',
        blocks: innerNormalized.blocks,
        blocks_layout: innerNormalized.blocks_layout,
      };
    });

    return {
      ...data,
      '@type': 'row',
      blockWidth: data.blockWidth || 'default',
      gridGap: data.gridGap || '1.5rem',
      gridTemplate:
        data.gridTemplate ||
        deriveGridTemplate({ items: columnIds }, normalizedCols),
      blocks_layout: { items: columnIds },
      blocks: normalizedCols,
    };
  }

  return data;
}

/**
 * Traverses a block tree and transforms all legacy columns and grid blocks into @type: 'row'.
 */
export function normalizeContentBlocks(
  blocks: Record<string, any> = {},
  blocks_layout: { items: string[] } = { items: [] },
): { blocks: Record<string, any>; blocks_layout: { items: string[] } } {
  if (!blocks || typeof blocks !== 'object') {
    return { blocks: {}, blocks_layout: { items: [] } };
  }

  const normalizedBlocks: Record<string, any> = {};
  const items = Array.isArray(blocks_layout?.items)
    ? blocks_layout.items
    : Object.keys(blocks);

  items.forEach((blockId) => {
    const blockData = blocks[blockId];
    if (!blockData) return;

    if (isLegacyContainerBlock(blockData) || blockData['@type'] === 'row') {
      normalizedBlocks[blockId] = normalizeRowData(blockData);
    } else if (blockData.blocks && blockData.blocks_layout) {
      // Any other container block (e.g. tabs, accordion, group)
      const childNormalized = normalizeContentBlocks(
        blockData.blocks,
        blockData.blocks_layout,
      );
      normalizedBlocks[blockId] = {
        ...blockData,
        blocks: childNormalized.blocks,
        blocks_layout: childNormalized.blocks_layout,
      };
    } else {
      normalizedBlocks[blockId] = blockData;
    }
  });

  return {
    blocks: normalizedBlocks,
    blocks_layout: { items },
  };
}
