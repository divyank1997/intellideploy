import React, { Suspense, lazy, useState } from 'react';

const RemoteDeploymentsList = lazy(() => import('mfe_deployments/DeploymentsList'));

interface Props {
  token: string;
}

export default function DeploymentsPage({ token }: Props) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await fetch('http://localhost:4001/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: projectName, repoUrl }),
      });
      const data = await res.json() as { success: boolean; error?: { message: string } };
      if (!data.success) { setError(data.error?.message ?? 'Failed'); return; }
      setShowNewProject(false);
      setRepoUrl('');
      setProjectName('');
    } catch {
      setError('Cannot reach API service');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 28px', borderBottom: '1px solid #1e293b',
      }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>Projects</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Manage and deploy your repositories</p>
        </div>
        <button
          onClick={() => setShowNewProject(!showNewProject)}
          style={{
            padding: '8px 16px', background: '#6366f1', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + New Project
        </button>
      </div>

      {/* New project form */}
      {showNewProject && (
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #1e293b', background: '#0a0f1e' }}>
          <form onSubmit={createProject} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <input
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              placeholder="GitHub repo URL (https://github.com/user/repo)"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              style={{ ...inputStyle, width: 320 }}
            />
            <button type="submit" disabled={creating} style={btnStyle}>
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowNewProject(false)} style={{ ...btnStyle, background: '#1e293b' }}>
              Cancel
            </button>
          </form>
          {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>
      )}

      {/* Remote MFE */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Suspense fallback={<div style={{ padding: 40, color: '#64748b' }}>Loading deployments…</div>}>
          <RemoteDeploymentsList token={token} />
        </Suspense>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', background: '#1e293b', border: '1px solid #334155',
  borderRadius: 6, color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', width: 200,
};

const btnStyle: React.CSSProperties = {
  padding: '8px 16px', background: '#6366f1', color: '#fff',
  border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer',
};
