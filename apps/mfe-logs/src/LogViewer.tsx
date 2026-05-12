import React, { useState, useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:4004/logs';

interface LogLine {
  line: string;
  timestamp: string;
}

interface Props {
  deploymentId?: string;
}

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '8px 16px', background: bg, color: '#fff',
  border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer',
  fontFamily: 'inherit',
});

export default function LogViewer({ deploymentId: initialId }: Props) {
  const [deploymentId, setDeploymentId] = useState(initialId ?? '');
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Auto-connect if deploymentId passed as prop
  useEffect(() => {
    if (initialId) {
      setDeploymentId(initialId);
      connectTo(initialId);
    }
    return () => wsRef.current?.close();
  }, [initialId]);

  const connectTo = (id: string) => {
    if (!id.trim()) return;
    setLogs([]);
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`${WS_URL}?deploymentId=${encodeURIComponent(id)}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
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

  const lineColor = (line: string) => {
    if (line.includes('[stderr]')) return '#f87171';
    if (line.startsWith('[intellideploy]')) return '#6366f1';
    return '#94a3b8';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '20px 28px', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>Live Build Logs</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
          Real-time stream via WebSocket → Redis Pub/Sub
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Deployment ID"
            value={deploymentId}
            onChange={(e) => setDeploymentId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && connectTo(deploymentId)}
            style={{
              padding: '8px 12px', background: '#1e293b', border: '1px solid #334155',
              borderRadius: 6, color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit',
              outline: 'none', width: 300,
            }}
          />
          {!connected ? (
            <button onClick={() => connectTo(deploymentId)} style={btnStyle('#6366f1')}>
              Connect
            </button>
          ) : (
            <button onClick={disconnect} style={btnStyle('#ef4444')}>
              Disconnect
            </button>
          )}
          {connected && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ade80' }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#4ade80', display: 'inline-block',
                boxShadow: '0 0 6px #4ade80',
              }} />
              Live
            </span>
          )}
          {logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              style={{ ...btnStyle('#1e293b'), border: '1px solid #334155', marginLeft: 'auto' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{
        flex: 1, overflow: 'auto', background: '#020817',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        fontSize: 13, padding: '16px 28px',
      }}>
        {logs.length === 0 && (
          <p style={{ color: '#334155' }}>
            {connected ? 'Waiting for build logs…' : 'Enter a deployment ID and press Connect'}
          </p>
        )}
        {logs.map((entry, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 3 }}>
            <span style={{ color: '#334155', flexShrink: 0, fontSize: 11, paddingTop: 1 }}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span style={{ color: lineColor(entry.line), wordBreak: 'break-all' }}>
              {entry.line}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
