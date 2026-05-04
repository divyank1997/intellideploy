import { Redis } from 'ioredis';
import type { WebSocket } from 'ws';

const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';

export function streamDeploymentLogs(deploymentId: string, ws: WebSocket): () => void {
  const subscriber = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

  subscriber.subscribe(`deployment:${deploymentId}`, (err) => {
    if (err) {
      ws.send(JSON.stringify({ error: 'Failed to subscribe to deployment logs' }));
      ws.close();
    }
  });

  subscriber.on('message', (_channel: string, message: string) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });

  const cleanup = () => {
    subscriber.unsubscribe();
    subscriber.quit();
  };

  ws.on('close', cleanup);
  ws.on('error', cleanup);

  return cleanup;
}
