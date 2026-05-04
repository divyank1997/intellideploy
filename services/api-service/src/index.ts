import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dbPlugin from './plugins/db';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';
import { deploymentRoutes } from './routes/deployments';

const app = Fastify({ logger: { level: 'info' } });

const start = async () => {
  await app.register(cors, { origin: true, credentials: true });
  await app.register(jwt, { secret: process.env['JWT_SECRET'] ?? 'fallback-secret' });
  await app.register(dbPlugin);
  await app.register(authRoutes);
  await app.register(projectRoutes);
  await app.register(deploymentRoutes);

  app.get('/health', async () => ({ status: 'ok', service: 'api-service' }));

  try {
    await app.listen({ port: Number(process.env['PORT'] ?? 4001), host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

void start();
