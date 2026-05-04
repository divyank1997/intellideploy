import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { webhookRoutes } from './routes/webhook';

const app = Fastify({ logger: { level: 'info' } });

const start = async () => {
  await app.register(cors, { origin: true });
  await app.register(webhookRoutes);

  app.get('/health', async () => ({ status: 'ok', service: 'github-service' }));

  try {
    await app.listen({ port: Number(process.env['PORT'] ?? 4002), host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

void start();
