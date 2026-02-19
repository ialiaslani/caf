import type { ReactNode } from 'react';

export interface DataFieldProps {
  label: string;
  value: ReactNode;
  style?: React.CSSProperties;
}

export function DataField({ label, value, style }: DataFieldProps) {
  return (
    <div
      style={{
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: '0.85rem',
          color: '#666',
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#333',
        }}
      >
        {value}
      </div>
    </div>
  );
}
