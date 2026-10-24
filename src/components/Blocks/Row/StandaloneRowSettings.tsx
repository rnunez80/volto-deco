import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { v4 as uuid } from 'uuid';
import ContainerWidthWidget from '../../Widgets/ContainerWidthWidget';
import RowStylePresetWidget, {
  STYLE_PRESETS,
} from '../../Widgets/RowStylePresetWidget';
import RowVerticalAlignWidget from '../../Widgets/RowVerticalAlignWidget';
import type { RowBlockData } from './normalize';

const messages = defineMessages({
  rowSettings: {
    id: 'Row Settings',
    defaultMessage: 'Row Settings',
  },
  rowDescription: {
    id: 'Select the container width for this row.',
    defaultMessage: 'Select the container width for this row.',
  },
  containerWidth: {
    id: 'Container Width',
    defaultMessage: 'Container Width',
  },
  stylePreset: {
    id: 'Style Preset',
    defaultMessage: 'Style Preset',
  },
  stylePresetDescription: {
    id: 'Select a visual style preset for this row.',
    defaultMessage: 'Select a visual style preset for this row.',
  },
  verticalAlignment: {
    id: 'Vertical Alignment',
    defaultMessage: 'Vertical Alignment',
  },
  verticalAlignmentDescription: {
    id: 'Align column contents vertically within this row.',
    defaultMessage: 'Align column contents vertically within this row.',
  },
  singleBlockRow: {
    id: 'Single Block Row',
    defaultMessage: 'Single Block Row',
  },
  convertToColumns: {
    id: 'Convert to Multi-Column Row',
    defaultMessage: 'Convert to Multi-Column Row',
  },
  convertToColumnsDesc: {
    id: 'Split this block into a 2-column row with an empty block alongside it.',
    defaultMessage:
      'Split this block into a 2-column row with an empty block alongside it.',
  },
});

interface StandaloneRowSettingsProps {
  block: string;
  type?: string;
  data: any;
  onChangeBlock: (blockId: string, updatedData: any) => void;
  onChangeFormData?: (newFormData: any) => void;
  onSelectBlock?: (blockId: string) => void;
  properties?: any;
}

const StandaloneRowSettings: React.FC<StandaloneRowSettingsProps> = ({
  block,
  type,
  data,
  onChangeBlock,
  onChangeFormData,
  onSelectBlock,
  properties,
}) => {
  const intl = useIntl();
  const currentWidth = data.blockWidth || 'default';

  const handleWidthChange = (id: string, value: any) => {
    onChangeBlock(block, {
      ...data,
      blockWidth: value,
    });
  };

  const handleStylePresetChange = (id: string, value: string) => {
    const selectedPreset = STYLE_PRESETS.find((p) => p.id === value);
    onChangeBlock(block, {
      ...data,
      style_name: value,
      styles: {
        ...(data.styles || {}),
        style_name: value,
        customClass: selectedPreset ? selectedPreset.cssClass : '',
      },
    });
  };

  const handleSplitIntoTwoColumns = () => {
    if (!properties || !onChangeFormData) return;

    const blocks = { ...(properties.blocks || {}) };
    const items = [...(properties.blocks_layout?.items || [])];

    const currentBlockData = blocks[block];
    if (!currentBlockData) return;

    const targetIndex = items.indexOf(block);
    delete blocks[block];

    const newRowId = uuid();
    const col1Id = uuid();
    const col2Id = uuid();
    const emptySlateId = uuid();

    const emptySlateBlock = {
      '@type': 'slate',
      value: [{ type: 'p', children: [{ text: '' }] }],
      plaintext: '',
    };

    const cleanedInnerBlockData = { ...currentBlockData };
    delete cleanedInnerBlockData.style_name;
    if (cleanedInnerBlockData.styles) {
      cleanedInnerBlockData.styles = { ...cleanedInnerBlockData.styles };
      delete cleanedInnerBlockData.styles.style_name;
      delete cleanedInnerBlockData.styles.customClass;
    }

    const newRow: RowBlockData = {
      '@type': 'row',
      blockWidth: currentBlockData.blockWidth || 'default',
      style_name: currentBlockData.style_name || '',
      styles: currentBlockData.styles || {},
      gridGap: '1.5rem',
      gridTemplate: '1fr 1fr',
      layoutPreset: '2-col-equal',
      alignItems: currentBlockData.alignItems || 'stretch',
      blocks_layout: {
        items: [col1Id, col2Id],
      },
      blocks: {
        [col1Id]: {
          '@type': 'rowColumn',
          id: col1Id,
          width: '1fr',
          blocks: {
            [block]: cleanedInnerBlockData,
          },
          blocks_layout: {
            items: [block],
          },
        } as any,
        [col2Id]: {
          '@type': 'rowColumn',
          id: col2Id,
          width: '1fr',
          blocks: {
            [emptySlateId]: emptySlateBlock,
          },
          blocks_layout: {
            items: [emptySlateId],
          },
        } as any,
      },
    };

    blocks[newRowId] = newRow;
    if (targetIndex > -1) {
      items.splice(targetIndex, 1, newRowId);
    } else {
      items.push(newRowId);
    }

    onChangeFormData({
      ...properties,
      blocks,
      blocks_layout: { items },
    });

    if (onSelectBlock) {
      onSelectBlock(newRowId);
    }
  };

  return (
    <div
      className="ui form standalone-row-settings"
      style={{ padding: '1rem' }}
    >
      <header className="header" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>
          {intl.formatMessage(messages.rowSettings)}
        </h2>
        <div
          style={{
            display: 'inline-block',
            marginTop: '0.4rem',
            padding: '2px 8px',
            background: '#f1f5f9',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#475569',
            fontWeight: 500,
          }}
        >
          {intl.formatMessage(messages.singleBlockRow)}{' '}
          {type ? `(${type})` : ''}
        </div>
      </header>

      <div className="field-group" style={{ marginBottom: '1.25rem' }}>
        <ContainerWidthWidget
          id="blockWidth"
          title={intl.formatMessage(messages.containerWidth)}
          description={intl.formatMessage(messages.rowDescription)}
          value={currentWidth}
          onChange={handleWidthChange}
        />
      </div>

      <div className="field-group" style={{ marginBottom: '1.25rem' }}>
        <RowStylePresetWidget
          id="style_name"
          title={intl.formatMessage(messages.stylePreset)}
          description={intl.formatMessage(messages.stylePresetDescription)}
          value={data.style_name || data.styles?.style_name || ''}
          onChange={handleStylePresetChange}
        />
      </div>

      <div className="field-group" style={{ marginBottom: '1.25rem' }}>
        <RowVerticalAlignWidget
          id="alignItems"
          title={intl.formatMessage(messages.verticalAlignment)}
          description={intl.formatMessage(
            messages.verticalAlignmentDescription,
          )}
          value={data.alignItems || 'stretch'}
          onChange={(id, val) =>
            onChangeBlock(block, { ...data, alignItems: val })
          }
        />
      </div>

      {onChangeFormData && (
        <div
          className="field-group convert-section"
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              marginBottom: '0.35rem',
              fontSize: '0.875rem',
            }}
          >
            {intl.formatMessage(messages.convertToColumns)}
          </label>
          <p
            style={{
              fontSize: '0.8rem',
              color: '#64748b',
              marginBottom: '0.75rem',
              lineHeight: 1.4,
            }}
          >
            {intl.formatMessage(messages.convertToColumnsDesc)}
          </p>
          <button
            type="button"
            className="ui basic button"
            onClick={handleSplitIntoTwoColumns}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.6rem 1rem',
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#1e293b',
              transition: 'all 0.15s ease',
            }}
          >
            <span>+</span>
            <span>Split into 2 Columns</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StandaloneRowSettings;
