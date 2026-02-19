export interface AvatarProps {
  initial: string;
  style?: React.CSSProperties;
}

export function Avatar({ initial, style }: AvatarProps) {
  return (
    <div
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 600,
        fontSize: '1.2rem',
        flexShrink: 0,
        ...style,
      }}
    >
      {initial}
    </div>
  );
}
