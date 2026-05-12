import React, { Suspense, lazy } from 'react';

const RemoteSettingsPanel = lazy(() => import('mfe_settings/SettingsPanel'));

interface Props {
  user: { name: string; email: string };
}

export default function SettingsPage({ user }: Props) {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#64748b' }}>Loading settings…</div>}>
      <RemoteSettingsPanel user={user} />
    </Suspense>
  );
}
