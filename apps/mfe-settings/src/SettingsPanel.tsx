import React, { useState } from 'react';

interface User {
  name: string;
  email: string;
}

interface Props {
  user: User;
  isPaid?: boolean;
  onUpgrade?: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{
        fontSize: 11, fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12,
      }}>
        {title}
      </h3>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 20px',
      borderBottom: last ? 'none' : '1px solid #1e293b',
    }}>
      <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function StatusDot({ online }: { online: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: online ? '#4ade80' : '#475569',
        display: 'inline-block',
      }} />
      <span style={{ color: online ? '#4ade80' : '#475569', fontSize: 12 }}>
        {online ? 'Running' : 'Offline'}
      </span>
    </span>
  );
}

export default function SettingsPanel({ user, isPaid = false, onUpgrade }: Props) {
  const [checking, setChecking] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Record<string, boolean>>({});

  const checkService = async (name: string, url: string) => {
    setChecking((prev) => ({ ...prev, [name]: true }));
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) });
      setStatus((prev) => ({ ...prev, [name]: res.ok }));
    } catch {
      setStatus((prev) => ({ ...prev, [name]: false }));
    } finally {
      setChecking((prev) => ({ ...prev, [name]: false }));
    }
  };

  const services = [
    { name: 'api', label: 'API Service', url: 'http://localhost:4001' },
    { name: 'builder', label: 'Builder Service', url: 'http://localhost:4003' },
    { name: 'github', label: 'GitHub Service', url: 'http://localhost:4002' },
    { name: 'ai', label: 'AI Service', url: 'http://localhost:4005' },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 620, fontFamily: 'Inter, sans-serif', color: '#e2e8f0' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Settings</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>Account and platform configuration</p>
      </div>

      <Section title="Account">
        <Row label="Name" value={user.name} />
        <Row label="Email" value={user.email} />
        <Row
          label="Plan"
          last
          value={
            isPaid ? (
              <span style={{ fontSize: 12, color: '#a78bfa', background: '#1e1b4b', padding: '2px 10px', borderRadius: 999, fontWeight: 500 }}>
                Pro
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#4ade80', background: '#052e16', padding: '2px 10px', borderRadius: 999, fontWeight: 500 }}>
                  Free
                </span>
                {onUpgrade && (
                  <button
                    onClick={onUpgrade}
                    style={{
                      fontSize: 12, color: '#a78bfa', background: 'transparent',
                      border: '1px solid #4c1d95', borderRadius: 5, padding: '2px 10px', cursor: 'pointer',
                    }}
                  >
                    Upgrade
                  </button>
                )}
              </span>
            )
          }
        />
      </Section>

      <Section title="AI Model">
        <Row label="Provider" value={isPaid ? 'Claude (Anthropic)' : 'Groq (Llama 3.3)'} />
        <Row label="Model" value={isPaid ? 'claude-sonnet-4-6' : 'llama-3.3-70b'} last />
      </Section>

      <Section title="Services">
        {services.map((svc, i) => (
          <div
            key={svc.name}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 20px',
              borderBottom: i === services.length - 1 ? 'none' : '1px solid #1e293b',
            }}
          >
            <span style={{ fontSize: 13, color: '#64748b' }}>{svc.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {status[svc.name] !== undefined && <StatusDot online={status[svc.name]} />}
              <button
                onClick={() => checkService(svc.name, svc.url)}
                disabled={checking[svc.name]}
                style={{
                  fontSize: 11, color: '#475569', background: 'transparent',
                  border: '1px solid #1e293b', borderRadius: 4, padding: '3px 10px',
                  cursor: 'pointer', opacity: checking[svc.name] ? 0.5 : 1,
                }}
              >
                {checking[svc.name] ? 'Checking…' : 'Ping'}
              </button>
            </span>
          </div>
        ))}
      </Section>

      <Section title="Infrastructure">
        <Row label="PostgreSQL" value="localhost:5432" />
        <Row label="Redis" value="localhost:6379" />
        <Row label="Build Runner" value="Docker (node:20-alpine)" />
        <Row label="Concurrency" value="3 parallel builds" last />
      </Section>
    </div>
  );
}
