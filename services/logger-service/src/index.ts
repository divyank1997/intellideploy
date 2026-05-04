import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { WebSocketServer } from 'ws';
import { streamDeploymentLogs } from './stream';

const app = Fastify({ logger: { level: 'info' } });

const start = async () => {
  await app.register(cors, { origin: true });

  app.get('/health', async () => ({ status: 'ok', service: 'logger-service' }));

  const port = Number(process.env['PORT'] ?? 4004);
  await app.listen({ port, host: '0.0.0.0' });

  // Attach WebSocket server to Fastify's underlying HTTP server
  const wss = new WebSocketServer({ server: app.server, path: '/logs' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url ?? '', `http://localhost`);
    const deploymentId = url.searchParams.get('deploymentId');

    if (!deploymentId) {
      ws.close(1008, 'Missing deploymentId');
      return;
    }

    app.log.info(`WebSocket connected for deployment ${deploymentId}`);
    streamDeploymentLogs(deploymentId, ws);
  });

  app.log.info(`Logger service + WebSocket ready on port ${port}`);
};

void start();
