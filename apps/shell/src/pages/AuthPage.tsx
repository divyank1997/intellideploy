import React, { useState } from 'react';
import type { AuthState } from '../App';

const API = 'http://localhost:4001';

interface Props {
  onAuth: (user: AuthState['user'], accessToken: string, refreshToken: string) => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = mode === 'register' ? { name, email, password } : { email, password };
      const res = await fetch(`${API}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { success: boolean; data?: { accessToken: string; refreshToken: string; user: { id: string; name: string; email: string } }; error?: { message: string } };
      if (!data.success || !data.data) {
        setError(data.error?.message ?? 'Authentication failed');
        return;
      }
      onAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
    } catch {
      setError('Cannot connect to server — is the API service running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#020817',
    }}>
      <div style={{
        width: 380, padding: 36, background: '#0f172a',
        border: '1px solid #1e293b', borderRadius: 12,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 28, color: '#6366f1' }}>▲</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginTop: 8 }}>IntelliDeploy</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Self-hosted deployment platform</p>
        </div>

        <div style={{ display: 'flex', marginBottom: 24, background: '#1e293b', borderRadius: 7, padding: 3 }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '7px 0', fontSize: 13, fontWeight: 500,
                borderRadius: 5, border: 'none', cursor: 'pointer',
                background: mode === m ? '#334155' : 'transparent',
                color: mode === m ? '#e2e8f0' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && (
            <p style={{ fontSize: 13, color: '#f87171', textAlign: 'center' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 0', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 7,
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
};
