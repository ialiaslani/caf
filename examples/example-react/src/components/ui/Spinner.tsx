export interface SpinnerProps {
  size?: number;
  style?: React.CSSProperties;
}

export function Spinner({ size = 40, style }: SpinnerProps) {
  return (
    <div
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        ...style,
      }}
    />
  );
}
