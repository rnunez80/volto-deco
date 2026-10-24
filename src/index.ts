import type { ConfigType } from '@plone/registry';
import rowSVG from '@plone/volto/icons/row.svg';
import { RowView, RowEdit, RowSchema } from './components/Blocks/Row';
import {
  RowLayoutPresetWidget,
  RowStylePresetWidget,
  RowVerticalAlignWidget,
} from './components/Widgets';
import installRowMigrationMiddleware from './middleware/rowMigrationMiddleware';

import './theme/deco.css';

export function applyConfig(config: ConfigType) {
  // 1. Register Row Widgets
  if (!config.widgets) {
    (config as any).widgets = {};
  }
  if (!config.widgets.widget) {
    (config.widgets as any).widget = {};
  }
  if (!config.widgets.id) {
    (config.widgets as any).id = {};
  }

  config.widgets.widget.row_style_preset = RowStylePresetWidget;
  config.widgets.id.style_name = RowStylePresetWidget;

  config.widgets.widget.row_vertical_align = RowVerticalAlignWidget;
  config.widgets.id.alignItems = RowVerticalAlignWidget;

  config.widgets.widget.row_layout_preset = RowLayoutPresetWidget;
  config.widgets.id.layoutPreset = RowLayoutPresetWidget;

  // 2. Register Multi-Column Row block (@type: 'row')
  if (!config.blocks) {
    (config as any).blocks = {};
  }
  if (!config.blocks.blocksConfig) {
    (config.blocks as any).blocksConfig = {};
  }

  (config.blocks.blocksConfig as any).row = {
    id: 'row',
    title: 'Row',
    icon: rowSVG,
    group: 'common',
    view: RowView,
    edit: RowEdit,
    schema: RowSchema,
    restricted: false,
    mostUsed: true,
    sidebarTab: 2,
  };

  // 3. Backward compatibility for legacy columnsBlock & gridBlock
  if (config.blocks?.blocksConfig?.columnsBlock) {
    config.blocks.blocksConfig.columnsBlock.restricted = true;
    config.blocks.blocksConfig.columnsBlock.mostUsed = false;
    config.blocks.blocksConfig.columnsBlock.view = RowView;
  }

  if (config.blocks?.blocksConfig?.gridBlock) {
    config.blocks.blocksConfig.gridBlock.restricted = true;
    config.blocks.blocksConfig.gridBlock.mostUsed = false;
    config.blocks.blocksConfig.gridBlock.view = RowView;
  }

  // 4. Install Redux migration middleware for in-flight legacy block normalization
  installRowMigrationMiddleware(config);

  return config;
}

export default applyConfig;

export { RowView, RowEdit, RowSchema } from './components/Blocks/Row';
export {
  normalizeRowData,
  deriveGridTemplate,
  normalizeContentBlocks,
} from './components/Blocks/Row/normalize';
export {
  splitBlocksIntoRow,
  moveBlockToRoot,
  moveBlockIntoColumn,
  insertBlockAsNewColumn,
} from './components/Blocks/Row/split';
export {
  RowLayoutPresetWidget,
  RowStylePresetWidget,
  RowVerticalAlignWidget,
} from './components/Widgets';
export { default as installRowMigrationMiddleware } from './middleware/rowMigrationMiddleware';
