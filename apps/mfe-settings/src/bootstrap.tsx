import React from 'react';
import { createRoot } from 'react-dom/client';
import SettingsPanel from './SettingsPanel';

const root = createRoot(document.getElementById('root')!);
root.render(
  <div style={{ background: '#020817', minHeight: '100vh' }}>
    <SettingsPanel user={{ name: 'Demo User', email: 'demo@intellideploy.com' }} />
  </div>
);
