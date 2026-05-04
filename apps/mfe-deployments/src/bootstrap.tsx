import React from 'react';
import { createRoot } from 'react-dom/client';
import DeploymentsList from './DeploymentsList';

const root = createRoot(document.getElementById('root')!);
root.render(
  <div style={{ fontFamily: 'Inter, sans-serif', background: '#020817', minHeight: '100vh', color: '#e2e8f0' }}>
    <DeploymentsList />
  </div>
);
