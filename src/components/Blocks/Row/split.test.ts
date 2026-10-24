import { describe, it, expect } from 'vitest';
import {
  splitBlocksIntoRow,
  moveBlockIntoColumn,
  insertBlockAsNewColumn,
} from './split';

describe('splitBlocksIntoRow', () => {
  it('splits two normal blocks into a new Row with 2 columns', () => {
    const formData = {
      blocks: {
        'block-1': { '@type': 'slate', value: ['Title'] },
        'block-2': { '@type': 'image', url: 'https://example.com/logo.png' },
        'block-3': { '@type': 'slate', value: ['Footer'] },
      },
      blocks_layout: {
        items: ['block-1', 'block-2', 'block-3'],
      },
    };

    // Drag block-2 to the right of block-1
    const result = splitBlocksIntoRow(formData, 'block-1', 'block-2', 'right');

    expect(result.blocks_layout.items.length).toBe(2);
    const newRowId = result.newRowId;
    expect(result.blocks_layout.items).toEqual([newRowId, 'block-3']);

    const newRow = result.blocks[newRowId];
    expect(newRow['@type']).toBe('row');
    expect(newRow.blocks_layout.items.length).toBe(2);

    const [col1Id, col2Id] = newRow.blocks_layout.items;
    expect(newRow.blocks[col1Id].blocks['block-1']).toEqual({
      '@type': 'slate',
      value: ['Title'],
    });
    expect(newRow.blocks[col2Id].blocks['block-2']).toEqual({
      '@type': 'image',
      url: 'https://example.com/logo.png',
    });
    expect(newRow.gridTemplate).toBe('1fr 1fr');
  });

  it('splits block to the left correctly', () => {
    const formData = {
      blocks: {
        'block-1': { '@type': 'slate', value: ['Main text'] },
        'block-2': { '@type': 'image', url: 'https://example.com/side.png' },
      },
      blocks_layout: {
        items: ['block-1', 'block-2'],
      },
    };

    // Drag block-2 to the left of block-1
    const result = splitBlocksIntoRow(formData, 'block-1', 'block-2', 'left');

    const newRow = result.blocks[result.newRowId];
    const [col1Id, col2Id] = newRow.blocks_layout.items;

    // Col 1 should be block-2 (dropped on left)
    expect(newRow.blocks[col1Id].blocks['block-2']).toBeDefined();
    // Col 2 should be block-1 (target on right)
    expect(newRow.blocks[col2Id].blocks['block-1']).toBeDefined();
  });

  it('appends a column when target is already a row', () => {
    const formData = {
      blocks: {
        'row-1': {
          '@type': 'row',
          gridTemplate: '1fr 1fr',
          blocks_layout: { items: ['col-a', 'col-b'] },
          blocks: {
            'col-a': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: {},
              blocks_layout: { items: [] },
            },
            'col-b': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: {},
              blocks_layout: { items: [] },
            },
          },
        },
        'block-new': {
          '@type': 'video',
          url: 'https://youtube.com/watch?v=123',
        },
      },
      blocks_layout: {
        items: ['row-1', 'block-new'],
      },
    };

    // Drag block-new to the right of row-1
    const result = splitBlocksIntoRow(formData, 'row-1', 'block-new', 'right');

    expect(result.blocks_layout.items).toEqual(['row-1']);
    const updatedRow = result.blocks['row-1'];
    expect(updatedRow.blocks_layout.items.length).toBe(3);
    expect(updatedRow.gridTemplate).toBe('1fr 1fr 1fr');

    const lastColId = updatedRow.blocks_layout.items[2];
    expect(updatedRow.blocks[lastColId].blocks['block-new']).toBeDefined();
  });

  it('moves block into an existing column via moveBlockIntoColumn', () => {
    const formData = {
      blocks: {
        'row-1': {
          '@type': 'row',
          blocks_layout: { items: ['col-1'] },
          blocks: {
            'col-1': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: {},
              blocks_layout: { items: [] },
            },
          },
        },
        'card-1': { '@type': 'teaser', title: 'Teaser' },
      },
      blocks_layout: {
        items: ['row-1', 'card-1'],
      },
    };

    const moved = moveBlockIntoColumn(formData, 'card-1', 'row-1', 'col-1');

    expect(moved.blocks_layout.items).toEqual(['row-1']);
    expect(moved.blocks['card-1']).toBeUndefined();
    expect(moved.blocks['row-1'].blocks['col-1'].blocks['card-1']).toEqual({
      '@type': 'teaser',
      title: 'Teaser',
    });
    expect(moved.blocks['row-1'].blocks['col-1'].blocks_layout.items).toEqual([
      'card-1',
    ]);
  });

  it('reorders blocks within the same column above and below', () => {
    const formData = {
      blocks: {
        'row-1': {
          '@type': 'row',
          blocks_layout: { items: ['col-1'] },
          blocks: {
            'col-1': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: {
                'block-a': { '@type': 'slate', value: ['A'] },
                'block-b': { '@type': 'slate', value: ['B'] },
                'block-c': { '@type': 'slate', value: ['C'] },
              },
              blocks_layout: { items: ['block-a', 'block-b', 'block-c'] },
            },
          },
        },
      },
      blocks_layout: { items: ['row-1'] },
    };

    // Move block-c before block-a (to the very top)
    const movedToTop = moveBlockIntoColumn(
      formData,
      'block-c',
      'row-1',
      'col-1',
      'block-a',
    );
    expect(
      movedToTop.blocks['row-1'].blocks['col-1'].blocks_layout.items,
    ).toEqual(['block-c', 'block-a', 'block-b']);

    // Move block-a after block-b (to the end, beforeId = null)
    const movedToEnd = moveBlockIntoColumn(
      formData,
      'block-a',
      'row-1',
      'col-1',
      null,
    );
    expect(
      movedToEnd.blocks['row-1'].blocks['col-1'].blocks_layout.items,
    ).toEqual(['block-b', 'block-c', 'block-a']);
  });

  it('adds a 3rd column when dragging a block into a 2-column row', () => {
    const formData = {
      blocks: {
        'row-1': {
          '@type': 'row',
          gridTemplate: '1fr 1fr',
          blocks_layout: { items: ['col-1', 'col-2'] },
          blocks: {
            'col-1': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: { 'block-1': { '@type': 'slate' } },
              blocks_layout: { items: ['block-1'] },
            },
            'col-2': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: { 'block-2': { '@type': 'slate' } },
              blocks_layout: { items: ['block-2'] },
            },
          },
        },
        'block-3': { '@type': 'image' },
      },
      blocks_layout: { items: ['row-1', 'block-3'] },
    };

    // Insert block-3 as new column after col-2
    const result = insertBlockAsNewColumn(
      formData,
      'block-3',
      'row-1',
      'col-2',
      'after',
    );

    const row = result.blocks['row-1'];
    expect(row.blocks_layout.items.length).toBe(3);
    expect(row.gridTemplate).toBe('1fr 1fr 1fr');
    expect(result.blocks['block-3']).toBeUndefined();
  });

  it('preserves existing 3 columns when adding a 4th column via splitBlocksIntoRow', () => {
    const formData = {
      blocks: {
        'row-1': {
          '@type': 'row',
          gridTemplate: '1fr 1fr 1fr',
          blocks_layout: { items: ['col-1', 'col-2', 'col-3'] },
          blocks: {
            'col-1': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: { 'block-1': { '@type': 'slate' } },
              blocks_layout: { items: ['block-1'] },
            },
            'col-2': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: { 'block-2': { '@type': 'slate' } },
              blocks_layout: { items: ['block-2'] },
            },
            'col-3': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: { 'block-3': { '@type': 'slate' } },
              blocks_layout: { items: ['block-3'] },
            },
          },
        },
        'block-4': { '@type': 'image' },
      },
      blocks_layout: { items: ['row-1', 'block-4'] },
    };

    const result = splitBlocksIntoRow(formData, 'row-1', 'block-4', 'right');
    const row = result.blocks['row-1'];
    expect(row.blocks_layout.items.length).toBe(4);
    expect(row.gridTemplate).toBe('1fr 1fr 1fr 1fr');
    expect(row.layoutPreset).toBe('4-col-equal');
  });

  it('does not remove source column when moving block between columns in same row', () => {
    const formData = {
      blocks: {
        'row-1': {
          '@type': 'row',
          blocks_layout: { items: ['col-1', 'col-2', 'col-3'] },
          blocks: {
            'col-1': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: { 'block-1': { '@type': 'slate' } },
              blocks_layout: { items: ['block-1'] },
            },
            'col-2': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: {},
              blocks_layout: { items: [] },
            },
            'col-3': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: { 'block-3': { '@type': 'slate' } },
              blocks_layout: { items: ['block-3'] },
            },
          },
        },
      },
      blocks_layout: { items: ['row-1'] },
    };

    const result = moveBlockIntoColumn(
      formData,
      'block-1',
      'row-1',
      'col-2',
      null,
    );
    const row = result.blocks['row-1'];
    expect(row.blocks_layout.items.length).toBe(3);
    expect(row.blocks['col-1']).toBeDefined();
    expect(row.blocks['col-2'].blocks_layout.items).toEqual(['block-1']);
  });

  it('moves a block from root above an existing item in a column', () => {
    const formData = {
      title: 'My Page',
      description: 'A test page',
      blocks: {
        'row-1': {
          '@type': 'row',
          blocks_layout: { items: ['col-1'] },
          blocks: {
            'col-1': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: { 'existing-item': { '@type': 'image' } },
              blocks_layout: { items: ['existing-item'] },
            },
          },
        },
        'dragged-item': { '@type': 'slate', value: ['New heading'] },
      },
      blocks_layout: { items: ['row-1', 'dragged-item'] },
    };

    // Move dragged-item before existing-item (above)
    const result = moveBlockIntoColumn(
      formData,
      'dragged-item',
      'row-1',
      'col-1',
      'existing-item',
    );

    expect(result.title).toBe('My Page');
    expect(result.description).toBe('A test page');
    expect(result.blocks_layout.items).toEqual(['row-1']);
    expect(result.blocks['dragged-item']).toBeUndefined();

    const col = result.blocks['row-1'].blocks['col-1'];
    expect(col.blocks_layout.items).toEqual(['dragged-item', 'existing-item']);
    expect(col.blocks['dragged-item']).toBeDefined();
  });

  it('moves a block from root below an existing item in a column', () => {
    const formData = {
      title: 'My Page',
      blocks: {
        'row-1': {
          '@type': 'row',
          blocks_layout: { items: ['col-1'] },
          blocks: {
            'col-1': {
              '@type': 'rowColumn',
              width: '1fr',
              blocks: { 'existing-item': { '@type': 'image' } },
              blocks_layout: { items: ['existing-item'] },
            },
          },
        },
        'dragged-item': { '@type': 'slate', value: ['New text'] },
      },
      blocks_layout: { items: ['row-1', 'dragged-item'] },
    };

    // Move dragged-item after existing-item (below, beforeBlockId = null)
    const result = moveBlockIntoColumn(
      formData,
      'dragged-item',
      'row-1',
      'col-1',
      null,
    );

    const col = result.blocks['row-1'].blocks['col-1'];
    expect(col.blocks_layout.items).toEqual(['existing-item', 'dragged-item']);
    expect(col.blocks['dragged-item']).toBeDefined();
  });
});
