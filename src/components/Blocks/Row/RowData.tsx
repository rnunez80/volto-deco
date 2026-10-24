import React from 'react';
import { RowSchema, LAYOUT_PRESETS } from './schema';
import { deriveGridTemplate } from './normalize';
import { STYLE_PRESETS } from '../../Widgets/RowStylePresetWidget';
import { BlockDataForm } from '@plone/volto/components';
import { useIntl } from 'react-intl';
import { v4 as uuid } from 'uuid';

interface RowDataProps {
  data: any;
  block: string;
  onChangeBlock: (blockId: string, data: any) => void;
  schemaEnhancer?: any;
  [key: string]: any;
}

const RowData: React.FC<RowDataProps> = (props) => {
  const { data, block, onChangeBlock, schemaEnhancer } = props;
  const intl = useIntl();

  const baseSchema = RowSchema({ ...props, intl });
  const schema = schemaEnhancer
    ? schemaEnhancer(baseSchema, props)
    : baseSchema;

  const handleChangeField = (id: string, value: any) => {
    let updatedData = {
      ...data,
      [id]: value,
    };

    if (id === 'style_name') {
      const selectedPreset = STYLE_PRESETS.find((p) => p.id === value);
      updatedData = {
        ...updatedData,
        style_name: value,
        styles: {
          ...(data.styles || {}),
          style_name: value,
          customClass: selectedPreset ? selectedPreset.cssClass : '',
        },
      };
    }

    if (id === 'layoutPreset' && value !== 'custom' && LAYOUT_PRESETS[value]) {
      const preset = LAYOUT_PRESETS[value];
      const targetCount = preset.widths.length;
      const currentItems = [...(data.blocks_layout?.items || [])];
      const currentBlocks = { ...(data.blocks || {}) };

      // Ensure we have at least targetCount columns
      while (currentItems.length < targetCount) {
        const newColId = uuid();
        currentItems.push(newColId);
        currentBlocks[newColId] = {
          '@type': 'rowColumn',
          id: newColId,
          width: preset.widths[currentItems.length - 1] || '1fr',
          blocks: {},
          blocks_layout: { items: [] },
        };
      }

      // Update column widths according to preset
      currentItems.forEach((colId, index) => {
        if (index < targetCount && currentBlocks[colId]) {
          currentBlocks[colId] = {
            ...currentBlocks[colId],
            width: preset.widths[index],
          };
        }
      });

      // NEVER drop columns that have content! Only trim extra trailing empty columns if user explicitly chose a smaller preset
      let finalItems = currentItems;
      if (currentItems.length > targetCount) {
        const canTrim = currentItems.slice(targetCount).every((cid) => {
          const c = currentBlocks[cid];
          return !c || (c.blocks_layout?.items || []).length === 0;
        });
        if (canTrim) {
          finalItems = currentItems.slice(0, targetCount);
        }
      }

      updatedData = {
        ...updatedData,
        layoutPreset: value,
        gridTemplate: deriveGridTemplate({ items: finalItems }, currentBlocks),
        blocks_layout: { items: finalItems },
        blocks: currentBlocks,
      };
    }

    onChangeBlock(block, updatedData);
  };

  return (
    <BlockDataForm
      schema={schema}
      title={intl.formatMessage({
        id: 'Row Settings',
        defaultMessage: 'Row Settings',
      })}
      onChangeField={handleChangeField}
      formData={data}
      block={block}
    />
  );
};

export default RowData;
