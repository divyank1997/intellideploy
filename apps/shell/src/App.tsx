import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

const DeploymentsPage = lazy(() => import('./pages/DeploymentsPage'));
const LogsPage = lazy(() => import('./pages/LogsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const API = 'http://localhost:4001';

export interface AuthState {
  user: { id: string; name: string; email: string };
}

// Access token lives in memory only — never touches localStorage
let inMemoryAccessToken: string | null = null;

export function getAccessToken() { return inMemoryAccessToken; }
export function setAccessToken(t: string | null) { inMemoryAccessToken = t; }

// Auto-refresh: call /auth/refresh using the stored refresh token
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('intellideploy_refresh');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json() as {
      success: boolean;
      data?: { accessToken: string; refreshToken: string; user: AuthState['user'] };
    };
    if (!data.success || !data.data) {
      localStorage.removeItem('intellideploy_refresh');
      localStorage.removeItem('intellideploy_user');
      return null;
    }
    setAccessToken(data.data.accessToken);
    localStorage.setItem('intellideploy_refresh', data.data.refreshToken);
    return data.data.accessToken;
  } catch {
    return null;
  }
}

// Fetch wrapper — auto-retries with refreshed token on 401
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error('SESSION_EXPIRED');
    return fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
    });
  }

  return res;
}

const NAV_ITEMS = [
  { to: '/deployments', label: 'Deployments', icon: '▲' },
  { to: '/logs', label: 'Logs', icon: '≡' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [restoring, setRestoring] = useState(true);

  // On page load — try to restore session from refresh token
  useEffect(() => {
    const storedUser = localStorage.getItem('intellideploy_user');
    const hasRefresh = localStorage.getItem('intellideploy_refresh');

    if (storedUser && hasRefresh) {
      refreshAccessToken().then((token) => {
        if (token) {
          setAuth({ user: JSON.parse(storedUser) as AuthState['user'] });
        }
        setRestoring(false);
      });
    } else {
      setRestoring(false);
    }
  }, []);

  const login = (user: AuthState['user'], accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken);
    localStorage.setItem('intellideploy_refresh', refreshToken);
    localStorage.setItem('intellideploy_user', JSON.stringify(user));
    setAuth({ user });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('intellideploy_refresh');
    if (refreshToken) {
      fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => null);
    }
    setAccessToken(null);
    localStorage.removeItem('intellideploy_refresh');
    localStorage.removeItem('intellideploy_user');
    setAuth(null);
  };

  if (restoring) {
    return <div style={{ background: '#020817', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>Loading…</div>;
  }

  if (!auth) {
    return <AuthPage onAuth={login} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: 220,
        background: '#0a0f1e',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, color: '#6366f1' }}>▲</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>IntelliDeploy</span>
          </div>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 14,
                color: isActive ? '#e2e8f0' : '#64748b',
                background: isActive ? '#1e293b' : 'transparent',
                marginBottom: 2,
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: 13 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b' }}>
          <p style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500, marginBottom: 2 }}>{auth.user.name}</p>
          <p style={{ fontSize: 11, color: '#475569', marginBottom: 10 }}>{auth.user.email}</p>
          <button
            onClick={logout}
            style={{
              width: '100%', padding: '6px 0', fontSize: 12, color: '#64748b',
              background: 'transparent', border: '1px solid #1e293b', borderRadius: 5, cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', background: '#020817' }}>
        <Suspense fallback={<div style={{ padding: 40, color: '#64748b' }}>Loading…</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/deployments" replace />} />
            <Route path="/deployments" element={<DeploymentsPage token={getAccessToken() ?? ''} />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/settings" element={<SettingsPage user={auth.user} />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
