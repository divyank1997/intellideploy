import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Badge } from './components/Badge';

function App() {
  return (
    <div style={{ padding: 32, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ marginBottom: 24 }}>IntelliDeploy Design System</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Button>Deploy</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="danger">Delete</Button>
      </div>
      <Card title="Example Card">
        <Badge status="success">Live</Badge>
        <Badge status="building">Building</Badge>
        <Badge status="failed">Failed</Badge>
      </Card>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
