import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  message: ReactNode;
  style?: React.CSSProperties;
}

export function EmptyState({ icon = '👥', message, style }: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: '#999',
        ...style,
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
