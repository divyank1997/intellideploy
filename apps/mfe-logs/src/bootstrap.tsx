import React from 'react';
import { createRoot } from 'react-dom/client';
import LogViewer from './LogViewer';

const root = createRoot(document.getElementById('root')!);
root.render(
  <div style={{ background: '#020817', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
    <LogViewer />
  </div>
);
