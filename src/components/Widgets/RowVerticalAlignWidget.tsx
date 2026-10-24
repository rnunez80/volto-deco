import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';

export interface AlignOption {
  id: string;
  label: string;
  title: string;
  icon: React.ReactNode;
}

const ALIGN_OPTIONS: AlignOption[] = [
  {
    id: 'stretch',
    label: 'Stretch',
    title: 'Equal Height (Stretch columns to match height)',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="3" x2="20" y2="3" />
        <line x1="4" y1="21" x2="20" y2="21" />
        <rect
          x="7"
          y="6"
          width="4"
          height="12"
          rx="1"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <rect
          x="13"
          y="6"
          width="4"
          height="12"
          rx="1"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </svg>
    ),
  },
  {
    id: 'start',
    label: 'Top',
    title: 'Top (Align columns to the top)',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="3" x2="20" y2="3" />
        <rect
          x="7"
          y="6"
          width="4"
          height="10"
          rx="1"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <rect
          x="13"
          y="6"
          width="4"
          height="6"
          rx="1"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </svg>
    ),
  },
  {
    id: 'center',
    label: 'Middle',
    title: 'Middle (Vertically center columns)',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="2 2" />
        <rect
          x="7"
          y="7"
          width="4"
          height="10"
          rx="1"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <rect
          x="13"
          y="9"
          width="4"
          height="6"
          rx="1"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </svg>
    ),
  },
  {
    id: 'end',
    label: 'Bottom',
    title: 'Bottom (Align columns to the bottom)',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="21" x2="20" y2="21" />
        <rect
          x="7"
          y="8"
          width="4"
          height="10"
          rx="1"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <rect
          x="13"
          y="12"
          width="4"
          height="6"
          rx="1"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </svg>
    ),
  },
];

interface RowVerticalAlignWidgetProps {
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

const RowVerticalAlignWidget: React.FC<RowVerticalAlignWidgetProps> = (
  props,
) => {
  const { id = 'alignItems', value = 'stretch', onChange } = props;
  const currentVal = value || 'stretch';

  return (
    <FormFieldWrapper {...props} className="row-valign-field">
      <div
        className="row-valign-widget"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          marginTop: '0.25rem',
        }}
      >
        {ALIGN_OPTIONS.map((opt) => {
          const isSelected = currentVal === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              className={`btn-valign-option ${isSelected ? 'active' : ''}`}
              onClick={() => onChange(id, opt.id)}
              title={opt.title}
              aria-label={opt.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '8px 4px',
                borderRadius: '6px',
                border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: isSelected ? '#f0f9ff' : '#ffffff',
                color: isSelected ? '#0284c7' : '#475569',
                boxShadow: isSelected
                  ? '0 0 0 1px #0284c7, 0 1px 2px rgba(0,0,0,0.05)'
                  : '0 1px 2px rgba(0,0,0,0.03)',
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
                  color: isSelected ? '#0284c7' : '#64748b',
                }}
              >
                {opt.icon}
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? '#0369a1' : '#334155',
                  lineHeight: 1,
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </FormFieldWrapper>
  );
};

export default RowVerticalAlignWidget;
