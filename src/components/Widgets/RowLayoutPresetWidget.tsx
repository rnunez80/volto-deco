import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';
import {
  LAYOUT_PRESETS,
  LEGACY_PRESET_MAP,
  type LayoutPresetInfo,
} from '../Blocks/Row/schema';

// List of layout presets rearranged ascending by number of columns (1 -> 2 -> 3 -> 4 -> 5 -> 6)
export const VISUAL_LAYOUT_PRESETS: LayoutPresetInfo[] = [
  // 1 Column
  LAYOUT_PRESETS['100'],

  // 2 Columns
  LAYOUT_PRESETS['50-50'],
  LAYOUT_PRESETS['60-40'],
  LAYOUT_PRESETS['40-60'],
  LAYOUT_PRESETS['70-30'],
  LAYOUT_PRESETS['30-70'],
  LAYOUT_PRESETS['80-20'],
  LAYOUT_PRESETS['20-80'],

  // 3 Columns
  LAYOUT_PRESETS['33-33-33'],
  LAYOUT_PRESETS['25-50-25'],
  LAYOUT_PRESETS['50-25-25'],

  // 4 Columns
  LAYOUT_PRESETS['25-25-25-25'],

  // 5 Columns
  LAYOUT_PRESETS['20-20-20-20-20'],

  // 6 Columns
  LAYOUT_PRESETS['6-columns'],
];

interface RowLayoutPresetWidgetProps {
  id?: string;
  value?: string;
  onChange: (id: string, value: string) => void;
  title?: string;
  description?: string;
  required?: boolean;
  wrapped?: boolean;
  className?: string;
  [key: string]: any;
}

const renderPresetIcon = (presetId: string, isSelected: boolean) => {
  const stroke = isSelected ? '#0284c7' : '#475569';
  const fill = isSelected ? 'rgba(2, 132, 199, 0.08)' : 'transparent';
  const strokeWidth = '2.4';
  const rx = '2.5';
  const y = '2';
  const height = '22';

  switch (presetId) {
    case '50-50':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="25"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="30"
            y={y}
            width="25"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '20-80':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="10"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="15"
            y={y}
            width="40"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '30-70':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="15"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="20"
            y={y}
            width="35"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '70-30':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="35"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="40"
            y={y}
            width="15"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '80-20':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="40"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="45"
            y={y}
            width="10"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '33-33-33':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="15"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="20.5"
            y={y}
            width="15"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="40"
            y={y}
            width="15"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '25-50-25':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="11"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="16"
            y={y}
            width="24"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="44"
            y={y}
            width="11"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '25-25-25-25':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="10"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="15"
            y={y}
            width="10"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="29"
            y={y}
            width="10"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="43"
            y={y}
            width="10"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '100':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="54"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '60-40':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="30"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="35"
            y={y}
            width="20"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '40-60':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="20"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="25"
            y={y}
            width="30"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '50-25-25':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="25"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="29"
            y={y}
            width="11.5"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <rect
            x="43.5"
            y={y}
            width="11.5"
            height={height}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case '20-20-20-20-20':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="8.6"
            height={height}
            rx="1.8"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.1"
          />
          <rect
            x="11.8"
            y={y}
            width="8.6"
            height={height}
            rx="1.8"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.1"
          />
          <rect
            x="22.6"
            y={y}
            width="8.6"
            height={height}
            rx="1.8"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.1"
          />
          <rect
            x="33.4"
            y={y}
            width="8.6"
            height={height}
            rx="1.8"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.1"
          />
          <rect
            x="44.2"
            y={y}
            width="10.8"
            height={height}
            rx="1.8"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.1"
          />
        </svg>
      );
    case '6-columns':
      return (
        <svg viewBox="0 0 56 26" width="46" height="22">
          <rect
            x="1"
            y={y}
            width="7"
            height={height}
            rx="1.5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.9"
          />
          <rect
            x="10"
            y={y}
            width="7"
            height={height}
            rx="1.5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.9"
          />
          <rect
            x="19"
            y={y}
            width="7"
            height={height}
            rx="1.5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.9"
          />
          <rect
            x="28"
            y={y}
            width="7"
            height={height}
            rx="1.5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.9"
          />
          <rect
            x="37"
            y={y}
            width="7"
            height={height}
            rx="1.5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.9"
          />
          <rect
            x="46"
            y={y}
            width="9"
            height={height}
            rx="1.5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.9"
          />
        </svg>
      );
    default:
      return null;
  }
};

const RowLayoutPresetWidget: React.FC<RowLayoutPresetWidgetProps> = (props) => {
  const { id = 'layoutPreset', value = '50-50', onChange } = props;

  // Resolve legacy preset keys like '2-col-equal' to '50-50'
  const normalizedValue = LEGACY_PRESET_MAP[value] || value || '50-50';

  return (
    <FormFieldWrapper {...props} className="row-layout-preset-field">
      <div
        className="row-layout-preset-widget"
        style={{ marginTop: '0.25rem' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))',
            gap: '8px',
          }}
        >
          {VISUAL_LAYOUT_PRESETS.map((preset) => {
            const isSelected = normalizedValue === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                className={`preset-layout-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onChange(id, preset.id)}
                title={preset.title}
                aria-label={preset.title}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px 8px 4px',
                  borderRadius: '6px',
                  border: isSelected
                    ? '2px solid #0284c7'
                    : '1px solid rgba(0, 0, 0, 0.12)',
                  background: isSelected ? '#edf2f7' : '#ffffff',
                  boxShadow: isSelected
                    ? '0 0 0 1px #0284c7, 0 1px 3px rgba(0,0,0,0.08)'
                    : '0 1px 2px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-in-out',
                  outline: 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px',
                  }}
                >
                  {renderPresetIcon(preset.id, isSelected)}
                </div>
                <span
                  style={{
                    fontSize:
                      preset.id === '20-20-20-20-20' ? '0.55rem' : '0.68rem',
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? '#0369a1' : '#64748b',
                    lineHeight: 1.1,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    letterSpacing:
                      preset.id === '20-20-20-20-20' ? '-0.02em' : 'normal',
                  }}
                >
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </FormFieldWrapper>
  );
};

export default RowLayoutPresetWidget;
