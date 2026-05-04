import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card({ title, children, style }: CardProps) {
  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '20px 24px',
        ...style,
      }}
    >
      {title && (
        <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
