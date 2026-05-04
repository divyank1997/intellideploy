import React, { useState, useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:4004/logs';

interface LogLine {
  line: string;
  timestamp: string;
}

export default function LogsPage() {
  const [deploymentId, setDeploymentId] = useState('');
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const connect = () => {
    if (!deploymentId.trim()) return;
    setLogs([]);
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`${WS_URL}?deploymentId=${encodeURIComponent(deploymentId)}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as LogLine;
        setLogs((prev) => [...prev, msg]);
      } catch {
        setLogs((prev) => [...prev, { line: e.data as string, timestamp: new Date().toISOString() }]);
      }
    };
  };

  const disconnect = () => {
    wsRef.current?.close();
    setConnected(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 28px', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>Live Build Logs</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Real-time log stream via WebSocket → Redis Pub/Sub</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
          <input
            placeholder="Deployment ID"
            value={deploymentId}
            onChange={(e) => setDeploymentId(e.target.value)}
            style={{
              padding: '8px 12px', background: '#1e293b', border: '1px solid #334155',
              borderRadius: 6, color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit',
              outline: 'none', width: 280,
            }}
          />
          {!connected ? (
            <button onClick={connect} style={btnStyle('#6366f1')}>Connect</button>
          ) : (
            <button onClick={disconnect} style={btnStyle('#ef4444')}>Disconnect</button>
          )}
          {connected && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ade80' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              Live
            </span>
          )}
        </div>
      </div>

      <div style={{
        flex: 1, overflow: 'auto',
        background: '#020817', fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        fontSize: 13, padding: '16px 28px',
      }}>
        {logs.length === 0 && (
          <p style={{ color: '#334155' }}>
            {connected ? 'Waiting for build logs…' : 'Enter a deployment ID and click Connect'}
          </p>
        )}
        {logs.map((entry, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 2 }}>
            <span style={{ color: '#334155', flexShrink: 0, fontSize: 11 }}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span style={{ color: entry.line.includes('[stderr]') ? '#f87171' : entry.line.startsWith('[intellideploy]') ? '#6366f1' : '#94a3b8' }}>
              {entry.line}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '8px 16px', background: bg, color: '#fff',
  border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer',
});
