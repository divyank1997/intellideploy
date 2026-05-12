import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { analyzeRoutes } from './routes/analyze';

const app = Fastify({ logger: { level: 'info' } });

const start = async () => {
  await app.register(cors, { origin: true });
  await app.register(analyzeRoutes);

  app.get('/health', async () => ({ status: 'ok', service: 'ai-service' }));

  try {
    await app.listen({ port: Number(process.env['PORT'] ?? 4005), host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

void start();
