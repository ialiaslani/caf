import type { InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label?: string;
  error?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export function Input({
  label,
  error,
  style,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const hasError = Boolean(error);
  const baseInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: hasError ? '2px solid #ff6b6b' : '2px solid #e0e0e0',
    borderRadius: '8px',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    ...inputStyle,
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = hasError ? '#ff6b6b' : '#667eea';
    e.currentTarget.style.boxShadow = hasError
      ? '0 0 0 3px rgba(255, 107, 107, 0.1)'
      : '0 0 0 3px rgba(102, 126, 234, 0.1)';
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = hasError ? '#ff6b6b' : '#e0e0e0';
    e.currentTarget.style.boxShadow = 'none';
    onBlur?.(e);
  };

  return (
    <div style={style}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#666',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <input
        style={baseInputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {error && (
        <div
          style={{
            marginTop: '0.5rem',
            color: '#ff6b6b',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
