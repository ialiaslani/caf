import type { ReactNode } from 'react';
import { Button } from './Button';

export interface AlertProps {
  message: ReactNode;
  onDismiss?: () => void;
  variant?: 'error' | 'info';
  style?: React.CSSProperties;
}

export function Alert({ message, onDismiss, variant = 'error', style }: AlertProps) {
  const isError = variant === 'error';
  return (
    <div
      style={{
        padding: '1rem',
        background: isError ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' : '#e3f2fd',
        color: isError ? 'white' : '#1565c0',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: isError ? '0 4px 12px rgba(255, 107, 107, 0.3)' : undefined,
        ...style,
      }}
    >
      <span>{message}</span>
      {onDismiss && (
        <Button variant={isError ? 'danger' : 'secondary'} onClick={onDismiss}>
          ✕
        </Button>
      )}
    </div>
  );
}
