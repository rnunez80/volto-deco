import React from 'react';
import type { ConfigType } from '@plone/registry';

export const blockWidthSchemaEnhancer = ({ schema, intl }: any) => {
  // blockWidth is now exclusively managed in the dedicated "Row" tab.
  // For standalone blocks, we ensure it is NOT in the default fieldsets of the Block tab.
  // For the Row block itself, its settings are in the Row tab, so preserve blockWidth:
  if (schema.title !== 'Row Settings' && schema.fieldsets?.[0]?.fields) {
    schema.fieldsets[0].fields = schema.fieldsets[0].fields.filter(
      (f: string) => f !== 'blockWidth',
    );
  }

  schema.properties = {
    ...schema.properties,
    blockWidth: {
      title: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Container Width',
            defaultMessage: 'Container Width',
          })
        : 'Container Width',
      description: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Select the maximum container width for this block',
            defaultMessage: 'Select the maximum container width for this block',
          })
        : 'Select the maximum container width for this block',
      type: 'string',
      widget: 'container_width',
      actions: ['narrow', 'default', 'layout', 'full'],
      default: 'default',
    },
  };

  return schema;
};

export default function installBlockWidth(config: ConfigType) {
  const defaultTargetBlocks = [
    'row',
    'slate',
    'image',
    'video',
    'listing',
    'form',
    '__button',
    'videohero',
    'countdown',
    'blackbaud',
    'fullcalendar',
    'tabs_block',
    'accordion',
    'leadimage',
    'teaser',
    'separator',
    'headerTitle',
    'typewriter',
    'textscramble',
  ];

  // Remove 'slate' from integratesBlockStyles so that StyleWrapperView wraps Slate blocks
  // uniformly with other blocks (like title) with <div className="styled-slate ...">,
  // enabling style presets and width adaptation in view mode.
  if (config.settings.integratesBlockStyles) {
    config.settings.integratesBlockStyles =
      config.settings.integratesBlockStyles.filter(
        (type: string) => type !== 'slate',
      );
  }

  if (config.blocks?.blocksConfig) {
    Object.keys(config.blocks.blocksConfig).forEach((blockName) => {
      // Exclude technical, subblocks or legacy container blocks
      if (
        ['empty', 'columnsBlock', 'gridBlock', 'nextPrevious', 'toc'].includes(
          blockName,
        )
      ) {
        return;
      }

      const blockConfig = config.blocks.blocksConfig[blockName];
      if (
        blockConfig &&
        (defaultTargetBlocks.includes(blockName) ||
          blockConfig.group === 'common' ||
          blockConfig.group === 'media' ||
          blockConfig.group === 'mostUsed' ||
          blockConfig.group === 'custom')
      ) {
        const prevEnhancer = blockConfig.schemaEnhancer;
        blockConfig.schemaEnhancer = (args: any) => {
          const resSchema = prevEnhancer ? prevEnhancer(args) : args.schema;
          return blockWidthSchemaEnhancer({ ...args, schema: resSchema });
        };

        const prevView = blockConfig.view;
        if (prevView && !(prevView as any)._blockWidthWrapped) {
          const BlockWidthViewWrapper = (props: any) => {
            const blockWidth = props.data?.blockWidth;
            const isCustomWidth = blockWidth && blockWidth !== 'default';
            return React.createElement(prevView, {
              ...props,
              ...(isCustomWidth ? { styled: true } : {}),
            });
          };
          (BlockWidthViewWrapper as any)._blockWidthWrapped = true;
          blockConfig.view = BlockWidthViewWrapper;
        }
      }
    });
  }

  // Register styleClassNameExtender so has--block-width--* and style presets are automatically
  // injected into block classNames across both View and Edit modes
  if (!config.settings.styleClassNameExtenders) {
    config.settings.styleClassNameExtenders = [];
  }
  const PRESET_CLASS_MAP: Record<string, string> = {
    primaryBox: 'primary-box',
    grayBox: 'gray-box',
    secondaryBox: 'secondary-box',
    tertiaryBox: 'tertiary-box',
    blueBox: 'blue-box',
    purpleBox: 'purple-box',
    statCards: 'stat-cards-box',
    statCardsPrimary: 'stat-cards-primary-box',
    redBlueBox: 'red-blue-box',
  };

  config.settings.styleClassNameExtenders.push(
    ({ data, classNames = [] }: any) => {
      const extra: string[] = [];
      const blockWidth =
        data?.['@type'] === 'headerTitle'
          ? 'full'
          : data?.blockWidth || 'default';
      const widthClass = `has--block-width--${blockWidth}`;
      if (!classNames.includes(widthClass)) {
        extra.push(widthClass);
      }
      if (blockWidth === 'full' && !classNames.includes('full-width')) {
        extra.push('full-width');
      }

      const styleName = data?.style_name || data?.styles?.style_name;
      if (styleName) {
        const styleNameClass = `has--style_name--${styleName}`;
        if (!classNames.includes(styleNameClass)) {
          extra.push(styleNameClass);
        }
        const customClass =
          data?.styles?.customClass || PRESET_CLASS_MAP[styleName];
        if (
          customClass &&
          !classNames.includes(customClass) &&
          !extra.includes(customClass)
        ) {
          extra.push(customClass);
        }
      }

      const hasBgImage = !!data?.backgroundImage;
      if (hasBgImage && !classNames.includes('has--background-image')) {
        extra.push('has--background-image');
      }

      const hasBackground = (!!styleName && styleName !== 'none') || hasBgImage;
      if (hasBackground && !classNames.includes('has--background')) {
        extra.push('has--background');
      }

      return extra.length > 0 ? [...classNames, ...extra] : classNames;
    },
  );

  return config;
}
