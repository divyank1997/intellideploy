import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

const DeploymentsPage = lazy(() => import('./pages/DeploymentsPage'));
const LogsPage = lazy(() => import('./pages/LogsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

export interface AuthState {
  token: string;
  user: { name: string; email: string };
}

const NAV_ITEMS = [
  { to: '/deployments', label: 'Deployments', icon: '▲' },
  { to: '/logs', label: 'Logs', icon: '≡' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const stored = localStorage.getItem('intellideploy_auth');
    return stored ? (JSON.parse(stored) as AuthState) : null;
  });

  const login = (state: AuthState) => {
    localStorage.setItem('intellideploy_auth', JSON.stringify(state));
    setAuth(state);
  };

  const logout = () => {
    localStorage.removeItem('intellideploy_auth');
    setAuth(null);
  };

  if (!auth) {
    return <AuthPage onAuth={login} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#0a0f1e',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, color: '#6366f1' }}>▲</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>IntelliDeploy</span>
          </div>
        </div>

        {/* Nav */}
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

        {/* User */}
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

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: '#020817' }}>
        <Suspense fallback={
          <div style={{ padding: 40, color: '#64748b' }}>Loading…</div>
        }>
          <Routes>
            <Route path="/" element={<Navigate to="/deployments" replace />} />
            <Route path="/deployments" element={<DeploymentsPage token={auth.token} />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/settings" element={<SettingsPage user={auth.user} />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
