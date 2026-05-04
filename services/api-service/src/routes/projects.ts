import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';

const createProjectSchema = z.object({
  name: z.string().min(1),
  repoUrl: z.string().url(),
});

export async function projectRoutes(app: FastifyInstance) {
  app.get('/projects', { preHandler: authenticate }, async (req, reply) => {
    const user = req.user as { id: string };
    const projects = await app.prisma.project.findMany({
      where: { userId: user.id },
      include: { deployments: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: projects });
  });

  app.post('/projects', { preHandler: authenticate }, async (req, reply) => {
    const user = req.user as { id: string };
    const result = createProjectSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { message: result.error.message } });
    }

    const project = await app.prisma.project.create({
      data: { ...result.data, userId: user.id },
    });
    return reply.status(201).send({ success: true, data: project });
  });

  app.delete('/projects/:id', { preHandler: authenticate }, async (req, reply) => {
    const user = req.user as { id: string };
    const { id } = req.params as { id: string };

    const project = await app.prisma.project.findFirst({ where: { id, userId: user.id } });
    if (!project) {
      return reply.status(404).send({ success: false, error: { message: 'Project not found' } });
    }

    await app.prisma.project.delete({ where: { id } });
    return reply.send({ success: true, data: { message: 'Project deleted' } });
  });
}
