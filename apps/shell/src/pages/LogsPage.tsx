import React, { Suspense, lazy } from 'react';

const RemoteLogViewer = lazy(() => import('mfe_logs/LogViewer'));

export default function LogsPage() {
  return (
    <div style={{ height: '100%' }}>
      <Suspense fallback={<div style={{ padding: 40, color: '#64748b' }}>Loading log viewer…</div>}>
        <RemoteLogViewer />
      </Suspense>
    </div>
  );
}
