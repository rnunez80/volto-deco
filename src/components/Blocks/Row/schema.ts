export interface LayoutPresetInfo {
  id: string;
  title: string;
  label: string;
  template: string;
  widths: string[];
  columns: number;
}

export const LAYOUT_PRESETS: Record<string, LayoutPresetInfo> = {
  '50-50': {
    id: '50-50',
    title: '2 Columns (50 / 50)',
    label: '50 / 50',
    template: '1fr 1fr',
    widths: ['1fr', '1fr'],
    columns: 2,
  },
  '20-80': {
    id: '20-80',
    title: '2 Columns (20 / 80)',
    label: '20 / 80',
    template: '1fr 4fr',
    widths: ['1fr', '4fr'],
    columns: 2,
  },
  '30-70': {
    id: '30-70',
    title: '2 Columns (30 / 70)',
    label: '30 / 70',
    template: '3fr 7fr',
    widths: ['3fr', '7fr'],
    columns: 2,
  },
  '70-30': {
    id: '70-30',
    title: '2 Columns (70 / 30)',
    label: '70 / 30',
    template: '7fr 3fr',
    widths: ['7fr', '3fr'],
    columns: 2,
  },
  '80-20': {
    id: '80-20',
    title: '2 Columns (80 / 20)',
    label: '80 / 20',
    template: '4fr 1fr',
    widths: ['4fr', '1fr'],
    columns: 2,
  },
  '33-33-33': {
    id: '33-33-33',
    title: '3 Columns (33 / 33 / 33)',
    label: '33 / 33 / 33',
    template: '1fr 1fr 1fr',
    widths: ['1fr', '1fr', '1fr'],
    columns: 3,
  },
  '25-50-25': {
    id: '25-50-25',
    title: '3 Columns (25 / 50 / 25)',
    label: '25 / 50 / 25',
    template: '1fr 2fr 1fr',
    widths: ['1fr', '2fr', '1fr'],
    columns: 3,
  },
  '25-25-25-25': {
    id: '25-25-25-25',
    title: '4 Columns (25 / 25 / 25 / 25)',
    label: '25 / 25 / 25 / 25',
    template: '1fr 1fr 1fr 1fr',
    widths: ['1fr', '1fr', '1fr', '1fr'],
    columns: 4,
  },
  '100': {
    id: '100',
    title: '1 Column (100)',
    label: '100',
    template: '1fr',
    widths: ['1fr'],
    columns: 1,
  },
  '60-40': {
    id: '60-40',
    title: '2 Columns (60 / 40)',
    label: '60 / 40',
    template: '3fr 2fr',
    widths: ['3fr', '2fr'],
    columns: 2,
  },
  '40-60': {
    id: '40-60',
    title: '2 Columns (40 / 60)',
    label: '40 / 60',
    template: '2fr 3fr',
    widths: ['2fr', '3fr'],
    columns: 2,
  },
  '50-25-25': {
    id: '50-25-25',
    title: '3 Columns (50 / 25 / 25)',
    label: '50 / 25 / 25',
    template: '2fr 1fr 1fr',
    widths: ['2fr', '1fr', '1fr'],
    columns: 3,
  },
  '20-20-20-20-20': {
    id: '20-20-20-20-20',
    title: '5 Columns (20 / 20 / 20 / 20 / 20)',
    label: '20/20/20/20/20',
    template: '1fr 1fr 1fr 1fr 1fr',
    widths: ['1fr', '1fr', '1fr', '1fr', '1fr'],
    columns: 5,
  },
  '6-columns': {
    id: '6-columns',
    title: '6 Columns (Equal)',
    label: '6 Columns',
    template: '1fr 1fr 1fr 1fr 1fr 1fr',
    widths: ['1fr', '1fr', '1fr', '1fr', '1fr', '1fr'],
    columns: 6,
  },
};

export const LEGACY_PRESET_MAP: Record<string, string> = {
  '1-col': '100',
  '2-col-equal': '50-50',
  '2-col-left-wide': '60-40',
  '2-col-right-wide': '40-60',
  '3-col-equal': '33-33-33',
  '3-col-center-wide': '25-50-25',
  '4-col-equal': '25-25-25-25',
  '5-col-equal': '20-20-20-20-20',
  '6-col-equal': '6-columns',
};

// Aliases for backwards compatibility
LAYOUT_PRESETS['1-col'] = LAYOUT_PRESETS['100'];
LAYOUT_PRESETS['2-col-equal'] = LAYOUT_PRESETS['50-50'];
LAYOUT_PRESETS['2-col-left-wide'] = LAYOUT_PRESETS['60-40'];
LAYOUT_PRESETS['2-col-right-wide'] = LAYOUT_PRESETS['40-60'];
LAYOUT_PRESETS['3-col-equal'] = LAYOUT_PRESETS['33-33-33'];
LAYOUT_PRESETS['3-col-center-wide'] = LAYOUT_PRESETS['25-50-25'];
LAYOUT_PRESETS['4-col-equal'] = LAYOUT_PRESETS['25-25-25-25'];
LAYOUT_PRESETS['5-col-equal'] = LAYOUT_PRESETS['20-20-20-20-20'];
LAYOUT_PRESETS['6-col-equal'] = LAYOUT_PRESETS['6-columns'];

export const RowSchema = ({ intl }: any = {}) => ({
  title: intl?.formatMessage
    ? intl.formatMessage({ id: 'Row Settings', defaultMessage: 'Row Settings' })
    : 'Row Settings',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'blockWidth',
        'style_name',
        'alignItems',
        'reverseMobile',
        'layoutPreset',
        'gridGap',
      ],
    },
  ],
  properties: {
    blockWidth: {
      title: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Container Width',
            defaultMessage: 'Container Width',
          })
        : 'Container Width',
      type: 'string',
      widget: 'container_width',
      actions: ['narrow', 'default', 'layout', 'full'],
      default: 'default',
    },
    style_name: {
      title: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Style Preset',
            defaultMessage: 'Style Preset',
          })
        : 'Style Preset',
      description: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Select a visual style preset for this row',
            defaultMessage: 'Select a visual style preset for this row',
          })
        : 'Select a visual style preset for this row',
      type: 'string',
      widget: 'row_style_preset',
      default: '',
    },
    alignItems: {
      title: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Vertical Alignment',
            defaultMessage: 'Vertical Alignment',
          })
        : 'Vertical Alignment',
      description: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Align column contents vertically within this row',
            defaultMessage: 'Align column contents vertically within this row',
          })
        : 'Align column contents vertically within this row',
      type: 'string',
      widget: 'row_vertical_align',
      default: 'stretch',
    },
    reverseMobile: {
      title: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Reverse on Mobile Devices',
            defaultMessage: 'Reverse on Mobile Devices',
          })
        : 'Reverse on Mobile Devices',
      description: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Reverse column stacking sequence on mobile screens',
            defaultMessage:
              'Reverse column stacking sequence on mobile screens',
          })
        : 'Reverse column stacking sequence on mobile screens',
      type: 'boolean',
      default: false,
    },
    layoutPreset: {
      title: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Column Layout',
            defaultMessage: 'Column Layout',
          })
        : 'Column Layout',
      description: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Select a layout preset for columns in this row',
            defaultMessage: 'Select a layout preset for columns in this row',
          })
        : 'Select a layout preset for columns in this row',
      type: 'string',
      widget: 'row_layout_preset',
      default: '50-50',
    },
    gridGap: {
      title: intl?.formatMessage
        ? intl.formatMessage({
            id: 'Column Spacing (Gap)',
            defaultMessage: 'Column Spacing (Gap)',
          })
        : 'Column Spacing (Gap)',
      type: 'string',
      factory: 'Choice',
      choices: [
        ['normal', 'Normal (1.5rem)'],
        ['small', 'Small (0.75rem)'],
        ['large', 'Large (2.5rem)'],
        ['none', 'None (0)'],
      ],
      default: 'normal',
    },
  },
  required: [],
});
