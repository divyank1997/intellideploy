import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { startWorker } from './worker';

const app = Fastify({ logger: { level: 'info' } });

const start = async () => {
  await app.register(cors, { origin: true });

  app.get('/health', async () => ({ status: 'ok', service: 'builder-service' }));

  try {
    await app.listen({ port: Number(process.env['PORT'] ?? 4003), host: '0.0.0.0' });
    startWorker();
    app.log.info('Builder worker started');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

void start();
