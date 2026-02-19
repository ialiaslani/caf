import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export function Badge({ children, style }: BadgeProps) {
  return (
    <span
      style={{
        background: 'rgba(255,255,255,0.2)',
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        fontSize: '0.9rem',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
