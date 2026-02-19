import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variants: Record<
  ButtonVariant,
  { background: string; color?: string; boxShadow?: string; hover: React.CSSProperties }
> = {
  primary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    hover: { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)' },
  },
  secondary: {
    background: '#f5f5f5',
    color: '#666',
    hover: { background: '#e0e0e0' },
  },
  danger: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    hover: { background: 'rgba(255,255,255,0.3)' },
  },
  ghost: {
    background: 'transparent',
    color: 'white',
    hover: {},
  },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth,
  disabled,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const v = variants[variant];
  const baseStyle: React.CSSProperties = {
    padding: variant === 'danger' ? '0.4rem 0.8rem' : '0.6rem 1.2rem',
    border: 'none',
    borderRadius: variant === 'danger' ? '6px' : '8px',
    fontSize: variant === 'danger' ? '0.85rem' : '0.9rem',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    width: fullWidth ? '100%' : undefined,
    background: disabled && variant === 'primary' ? '#ccc' : v.background,
    color: v.color ?? 'white',
    boxShadow: disabled && variant === 'primary' ? 'none' : v.boxShadow,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (v.hover && Object.keys(v.hover).length) Object.assign(e.currentTarget.style, v.hover);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (v.hover && Object.keys(v.hover).length) {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = variant === 'primary' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : '';
      e.currentTarget.style.background = variant === 'secondary' ? '#f5f5f5' : variant === 'danger' ? 'rgba(255,255,255,0.2)' : '';
    }
    onMouseLeave?.(e);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      style={{ ...baseStyle, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </button>
  );
}
