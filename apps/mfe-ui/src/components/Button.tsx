import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const styles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: '#6366f1', color: '#fff', border: 'none' },
  secondary: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' },
  danger: { background: '#ef4444', color: '#fff', border: 'none' },
};

export function Button({ variant = 'primary', loading, children, disabled, style, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        padding: '8px 16px',
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        fontFamily: 'inherit',
        transition: 'opacity 0.2s',
        ...styles[variant],
        ...style,
      }}
      {...rest}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}
