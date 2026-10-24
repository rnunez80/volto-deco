import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';

export interface StylePresetOption {
  id: string;
  title: string;
  cssClass: string;
  color: string;
  textColor: string;
  border?: string;
  description?: string;
}

export const STYLE_PRESETS: StylePresetOption[] = [
  {
    id: '',
    title: 'None',
    cssClass: '',
    color: '#ffffff',
    textColor: '#64748b',
    border: '1px dashed #cbd5e1',
    description: 'Default transparent background',
  },
  {
    id: 'primaryBox',
    title: 'Primary',
    cssClass: 'primary-box',
    color: '#d92518',
    textColor: '#ffffff',
    description: 'York Red background with white text',
  },
  {
    id: 'grayBox',
    title: 'Gray',
    cssClass: 'gray-box',
    color: '#eeeeee',
    textColor: '#1e293b',
    description: 'Soft gray background with dark text',
  },
  {
    id: 'secondaryBox',
    title: 'Secondary',
    cssClass: 'secondary-box',
    color: '#2e3233',
    textColor: '#ffffff',
    description: 'Charcoal slate background with white text',
  },
  {
    id: 'tertiaryBox',
    title: 'Tertiary',
    cssClass: 'tertiary-box',
    color: '#FFB907',
    textColor: '#111111',
    description: 'York Gold background with dark text',
  },
  {
    id: 'blueBox',
    title: 'Blue',
    cssClass: 'blue-box',
    color: '#1D3A83',
    textColor: '#ffffff',
    description: 'Deep navy background with white text',
  },
  {
    id: 'purpleBox',
    title: 'Purple',
    cssClass: 'purple-box',
    color: 'linear-gradient(89deg, #d82323 0%, #8363AA 100%)',
    textColor: '#ffffff',
    description: 'Red-to-purple gradient with white text',
  },
  {
    id: 'statCards',
    title: 'Stat Cards',
    cssClass: 'stat-cards-box',
    color: '#ffffff',
    textColor: '#1e293b',
    border: '2px solid #cbd5e1',
    description:
      'White elevated cards with rounded corners for metrics and stats',
  },
  {
    id: 'statCardsPrimary',
    title: 'Red + Cards',
    cssClass: 'stat-cards-primary-box',
    color: 'linear-gradient(to bottom, #d92518 50%, #ffffff 50%)',
    textColor: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.15)',
    description: 'York Red banner with white elevated stat cards',
  },
];

interface RowStylePresetWidgetProps {
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

const RowStylePresetWidget: React.FC<RowStylePresetWidgetProps> = (props) => {
  const { id = 'style_name', value = '', onChange } = props;
  const currentVal = value || '';

  return (
    <FormFieldWrapper {...props} className="row-style-preset-field">
      <div className="row-style-preset-widget" style={{ marginTop: '0.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: '8px',
          }}
        >
          {STYLE_PRESETS.map((preset) => {
            const isSelected = currentVal === preset.id;

            return (
              <button
                key={preset.id || 'none'}
                type="button"
                className={`preset-swatch-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onChange(id, preset.id)}
                title={preset.description || preset.title}
                aria-label={preset.title}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px',
                  borderRadius: '6px',
                  border: isSelected
                    ? '2px solid #0284c7'
                    : '1px solid rgba(0, 0, 0, 0.12)',
                  background: isSelected ? '#f0f9ff' : '#ffffff',
                  boxShadow: isSelected
                    ? '0 0 0 1px #0284c7, 0 1px 3px rgba(0,0,0,0.1)'
                    : '0 1px 2px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-in-out',
                  position: 'relative',
                  outline: 'none',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: preset.color,
                    border: preset.border || '1px solid rgba(0, 0, 0, 0.15)',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
                  }}
                >
                  {!preset.id && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      ∅
                    </span>
                  )}
                  {isSelected && preset.id && (
                    <span
                      style={{
                        fontSize: '12px',
                        color:
                          preset.textColor === '#111111'
                            ? '#111111'
                            : '#ffffff',
                        fontWeight: 'bold',
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? '#0369a1' : '#334155',
                    lineHeight: 1.1,
                    textAlign: 'center',
                  }}
                >
                  {preset.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </FormFieldWrapper>
  );
};

export default RowStylePresetWidget;
