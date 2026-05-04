import React from 'react';

type DeployStatus = 'queued' | 'building' | 'success' | 'failed';

interface BadgeProps {
  status: DeployStatus;
  children: React.ReactNode;
}

const colors: Record<DeployStatus, { bg: string; text: string }> = {
  queued:   { bg: '#1e293b', text: '#94a3b8' },
  building: { bg: '#1c1917', text: '#fb923c' },
  success:  { bg: '#052e16', text: '#4ade80' },
  failed:   { bg: '#1c0a0a', text: '#f87171' },
};

export function Badge({ status, children }: BadgeProps) {
  const { bg, text } = colors[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: bg,
        color: text,
        marginRight: 8,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: text,
          display: 'inline-block',
        }}
      />
      {children}
    </span>
  );
}
