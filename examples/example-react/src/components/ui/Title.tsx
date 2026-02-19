import type { ReactNode } from 'react';

export interface TitleProps {
  as?: 'h1' | 'h2' | 'h3';
  children: ReactNode;
  style?: React.CSSProperties;
}

const styles: Record<string, React.CSSProperties> = {
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#333',
    margin: 0,
    marginBottom: '1.5rem',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#333',
    margin: 0,
  },
};

export function Title({ as: Tag = 'h1', children, style }: TitleProps) {
  return <Tag style={{ ...styles[Tag], ...style }}>{children}</Tag>;
}
