import React, { useEffect, useState } from 'react';

const API = process.env['API_URL'] ?? 'http://localhost:4001';

type Status = 'queued' | 'building' | 'success' | 'failed';

interface Project {
  id: string;
  name: string;
  repoUrl: string;
  framework: string;
  createdAt: string;
  deployments: Array<{
    id: string;
    status: Status;
    branch: string;
    commitMessage: string;
    buildDuration: number | null;
    createdAt: string;
  }>;
}

const statusColor: Record<Status, string> = {
  queued: '#94a3b8',
  building: '#fb923c',
  success: '#4ade80',
  failed: '#f87171',
};

const statusBg: Record<Status, string> = {
  queued: '#1e293b',
  building: '#1c1917',
  success: '#052e16',
  failed: '#1c0a0a',
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500,
      background: statusBg[status], color: statusColor[status],
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[status] }} />
      {status}
    </span>
  );
}

export default function DeploymentsList({ token }: { token?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setProjects(data.data ?? []); setLoading(false); })
      .catch(() => { setError('Failed to load projects'); setLoading(false); });
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: 16 }}>Sign in to view your deployments</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 40, color: '#64748b' }}>Loading projects…</div>;
  }

  if (error) {
    return <div style={{ padding: 40, color: '#f87171' }}>{error}</div>;
  }

  if (projects.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: 16, marginBottom: 8 }}>No projects yet</p>
        <p style={{ color: '#475569', fontSize: 14 }}>Connect a GitHub repository to deploy your first project</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {projects.map((project) => {
        const latest = project.deployments[0];
        return (
          <div
            key={project.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px',
              background: '#0f172a',
              borderBottom: '1px solid #1e293b',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
          >
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{project.name}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#475569' }}>
                {project.repoUrl.replace('https://github.com/', '')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {latest ? (
                <>
                  <StatusBadge status={latest.status as Status} />
                  <span style={{ fontSize: 12, color: '#475569' }}>
                    {latest.branch} · {new Date(latest.createdAt).toLocaleDateString()}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: '#475569' }}>Never deployed</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
