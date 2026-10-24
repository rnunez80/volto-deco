import { describe, it, expect } from 'vitest';
import {
  normalizeColumnsBlock,
  normalizeGridBlock,
  normalizeRowData,
  normalizeContentBlocks,
  isLegacyContainerBlock,
  deriveGridTemplate,
} from './normalize';
import { rowMigrationMiddleware } from '../../../middleware/rowMigrationMiddleware';

describe('Multi-Column Row Normalization Engine', () => {
  it('correctly identifies legacy container blocks', () => {
    expect(isLegacyContainerBlock({ '@type': 'columnsBlock' })).toBe(true);
    expect(isLegacyContainerBlock({ '@type': 'gridBlock' })).toBe(true);
    expect(isLegacyContainerBlock({ '@type': 'row' })).toBe(false);
    expect(isLegacyContainerBlock({ '@type': 'slate' })).toBe(false);
    expect(isLegacyContainerBlock(null)).toBe(false);
  });

  describe('EEA columnsBlock normalization', () => {
    it('normalizes legacy EEA columnsBlock with 2 equal columns', () => {
      const legacyEEAData = {
        '@type': 'columnsBlock',
        data: {
          blocks_layout: {
            items: ['col-1', 'col-2'],
          },
          blocks: {
            'col-1': {
              grid_size: 6,
              blocks_layout: { items: ['text-1'] },
              blocks: {
                'text-1': { '@type': 'slate', value: ['Hello'] },
              },
            },
            'col-2': {
              grid_size: 6,
              blocks_layout: { items: ['img-1'] },
              blocks: {
                'img-1': {
                  '@type': 'image',
                  url: 'https://example.com/pic.jpg',
                },
              },
            },
          },
        },
      };

      const normalized = normalizeColumnsBlock(legacyEEAData);

      expect(normalized['@type']).toBe('row');
      expect(normalized.blocks_layout.items).toEqual(['col-1', 'col-2']);
      expect(normalized.blocks['col-1']['@type']).toBe('rowColumn');
      expect(normalized.blocks['col-1'].width).toBe('6fr');
      expect(normalized.blocks['col-1'].blocks['text-1']).toEqual({
        '@type': 'slate',
        value: ['Hello'],
      });
      expect(normalized.blocks['col-2']['@type']).toBe('rowColumn');
      expect(normalized.blocks['col-2'].blocks['img-1']).toEqual({
        '@type': 'image',
        url: 'https://example.com/pic.jpg',
      });
      expect(normalized.gridTemplate).toBe('6fr 6fr');
    });

    it('creates an empty column if legacy columnsBlock had no columns', () => {
      const emptyEEA = {
        '@type': 'columnsBlock',
        data: {
          blocks_layout: { items: [] },
          blocks: {},
        },
      };

      const normalized = normalizeColumnsBlock(emptyEEA);
      expect(normalized['@type']).toBe('row');
      expect(normalized.blocks_layout.items.length).toBe(1);
      expect(normalized.blocks['col-default']['@type']).toBe('rowColumn');
    });
  });

  describe('Volto core gridBlock normalization', () => {
    it('normalizes legacy gridBlock with individual items into wrapped row columns', () => {
      const legacyGridData = {
        '@type': 'gridBlock',
        headline: 'Featured Stories',
        columns: 3,
        blocks_layout: {
          items: ['teaser-1', 'teaser-2', 'teaser-3'],
        },
        blocks: {
          'teaser-1': { '@type': 'teaser', title: 'Story 1' },
          'teaser-2': { '@type': 'teaser', title: 'Story 2' },
          'teaser-3': { '@type': 'teaser', title: 'Story 3' },
        },
      };

      const normalized = normalizeGridBlock(legacyGridData);

      expect(normalized['@type']).toBe('row');
      expect(normalized.headline).toBe('Featured Stories');
      expect(normalized.blocks_layout.items).toEqual([
        'col-teaser-1',
        'col-teaser-2',
        'col-teaser-3',
      ]);
      expect(normalized.blocks['col-teaser-1']['@type']).toBe('rowColumn');
      expect(normalized.blocks['col-teaser-1'].width).toBe('1fr');
      expect(normalized.blocks['col-teaser-1'].blocks['teaser-1']).toEqual({
        '@type': 'teaser',
        title: 'Story 1',
      });
      expect(normalized.gridTemplate).toBe('1fr 1fr 1fr');
    });
  });

  describe('normalizeRowData dispatcher', () => {
    it('dispatches columnsBlock and gridBlock correctly', () => {
      const eea = {
        '@type': 'columnsBlock',
        data: { blocks_layout: { items: [] }, blocks: {} },
      };
      const grid = {
        '@type': 'gridBlock',
        blocks_layout: { items: [] },
        blocks: {},
      };
      const alreadyRow = {
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
      };

      expect(normalizeRowData(eea)['@type']).toBe('row');
      expect(normalizeRowData(grid)['@type']).toBe('row');
      expect(normalizeRowData(alreadyRow)['@type']).toBe('row');
    });
  });

  describe('Recursive content tree normalization (normalizeContentBlocks)', () => {
    it('normalizes all columnsBlock and gridBlock across a page payload', () => {
      const pageBlocks = {
        'block-intro': { '@type': 'slate', value: ['Intro text'] },
        'block-legacy-cols': {
          '@type': 'columnsBlock',
          data: {
            blocks_layout: { items: ['col-a'] },
            blocks: {
              'col-a': {
                blocks_layout: { items: ['inner-item'] },
                blocks: { 'inner-item': { '@type': 'slate', value: ['Sub'] } },
              },
            },
          },
        },
        'block-legacy-grid': {
          '@type': 'gridBlock',
          blocks_layout: { items: ['card-1'] },
          blocks: { 'card-1': { '@type': 'teaser', title: 'Card' } },
        },
      };

      const pageLayout = {
        items: ['block-intro', 'block-legacy-cols', 'block-legacy-grid'],
      };

      const result = normalizeContentBlocks(pageBlocks, pageLayout);

      expect(result.blocks['block-intro']['@type']).toBe('slate');
      expect(result.blocks['block-legacy-cols']['@type']).toBe('row');
      expect(result.blocks['block-legacy-grid']['@type']).toBe('row');
      expect(result.blocks_layout.items).toEqual([
        'block-intro',
        'block-legacy-cols',
        'block-legacy-grid',
      ]);
    });
  });

  describe('deriveGridTemplate', () => {
    it('calculates grid template from column widths', () => {
      const layout = { items: ['c1', 'c2'] };
      const blocks = {
        c1: { width: '2fr' },
        c2: { width: '1fr' },
      };
      expect(deriveGridTemplate(layout, blocks)).toBe('2fr 1fr');
    });

    it('defaults to 1fr when no widths are specified', () => {
      const layout = { items: ['c1', 'c2', 'c3'] };
      expect(deriveGridTemplate(layout, {})).toBe('1fr 1fr 1fr');
    });
  });

  describe('rowMigrationMiddleware', () => {
    it('normalizes GET_CONTENT_SUCCESS action result', () => {
      const middleware = rowMigrationMiddleware({});
      let dispatchedAction: any = null;
      const next = (action: any) => {
        dispatchedAction = action;
        return action;
      };

      const action = {
        type: 'GET_CONTENT_SUCCESS',
        result: {
          blocks: {
            b1: {
              '@type': 'columnsBlock',
              data: {
                blocks_layout: { items: ['col-1'] },
                blocks: {
                  'col-1': {
                    blocks_layout: { items: [] },
                    blocks: {},
                  },
                },
              },
            },
          },
          blocks_layout: { items: ['b1'] },
        },
      };

      middleware(next)(action);

      expect(dispatchedAction.result.blocks['b1']['@type']).toBe('row');
    });

    it('normalizes UPDATE_CONTENT_PENDING request data before save', () => {
      const middleware = rowMigrationMiddleware({});
      let dispatchedAction: any = null;
      const next = (action: any) => {
        dispatchedAction = action;
        return action;
      };

      const action = {
        type: 'UPDATE_CONTENT_PENDING',
        request: {
          data: {
            blocks: {
              'grid-1': {
                '@type': 'gridBlock',
                blocks_layout: { items: ['t1'] },
                blocks: { t1: { '@type': 'teaser' } },
              },
            },
            blocks_layout: { items: ['grid-1'] },
          },
        },
      };

      middleware(next)(action);

      expect(dispatchedAction.request.data.blocks['grid-1']['@type']).toBe(
        'row',
      );
    });
  });
});
