import React from 'react';

interface Props {
  user: { name: string; email: string };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
        {title}
      </h3>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1e293b' }}>
      <span style={{ fontSize: 14, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function SettingsPage({ user }: Props) {
  return (
    <div style={{ padding: 28, maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>Settings</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Account and platform configuration</p>
      </div>

      <Section title="Account">
        <Row label="Name" value={user.name} />
        <Row label="Email" value={user.email} />
        <div style={{ padding: '14px 20px' }}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>Plan</span>
          <span style={{ fontSize: 12, color: '#4ade80', background: '#052e16', padding: '2px 10px', borderRadius: 999, marginLeft: 12, fontWeight: 500 }}>
            Self-hosted
          </span>
        </div>
      </Section>

      <Section title="Services">
        <Row label="API Service" value="http://localhost:4001" />
        <Row label="Builder Service" value="http://localhost:4003" />
        <Row label="Logger Service (WebSocket)" value="ws://localhost:4004/logs" />
        <Row label="AI Service" value="http://localhost:4005" />
      </Section>

      <Section title="Infrastructure">
        <Row label="PostgreSQL" value="localhost:5432" />
        <Row label="Redis" value="localhost:6379" />
        <Row label="Build Runner" value="Docker (node:20-alpine)" />
        <div style={{ padding: '14px 20px' }}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>Concurrency</span>
          <span style={{ fontSize: 14, color: '#e2e8f0', marginLeft: 12 }}>3 parallel builds</span>
        </div>
      </Section>
    </div>
  );
}
