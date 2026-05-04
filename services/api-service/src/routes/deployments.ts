import type { FastifyInstance } from 'fastify';
import { Queue } from 'bullmq';
import { z } from 'zod';

const buildsQueue = new Queue('builds', {
  connection: { host: 'localhost', port: 6379 },
});

const triggerSchema = z.object({
  projectId: z.string(),
  repoUrl: z.string().url(),
  branch: z.string(),
  commitSha: z.string(),
  commitMessage: z.string(),
});

const statusSchema = z.object({
  status: z.enum(['queued', 'building', 'success', 'failed']),
  buildDuration: z.number().optional(),
  aiErrorExplanation: z.string().optional(),
});

export async function deploymentRoutes(app: FastifyInstance) {
  app.post('/deployments/trigger', async (req, reply) => {
    const result = triggerSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { message: result.error.message } });
    }

    const { projectId, repoUrl, branch, commitSha, commitMessage } = result.data;

    const project = await app.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return reply.status(404).send({ success: false, error: { message: 'Project not found' } });
    }

    const previewUrl = `https://${project.name}-${commitSha.slice(0, 7)}.intellideploy.local`;

    const deployment = await app.prisma.deployment.create({
      data: { projectId, branch, commitSha, commitMessage, previewUrl, status: 'queued' },
    });

    await buildsQueue.add('build', {
      deploymentId: deployment.id,
      repoUrl,
      branch,
    });

    return reply.status(201).send({ success: true, data: deployment });
  });

  app.patch('/deployments/:id/status', async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = statusSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { message: result.error.message } });
    }

    const deployment = await app.prisma.deployment.update({
      where: { id },
      data: result.data,
    });

    return reply.send({ success: true, data: deployment });
  });

  app.get('/deployments/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    const deployment = await app.prisma.deployment.findUnique({
      where: { id },
      include: { logs: { orderBy: { createdAt: 'asc' } } },
    });

    if (!deployment) {
      return reply.status(404).send({ success: false, error: { message: 'Deployment not found' } });
    }

    return reply.send({ success: true, data: deployment });
  });
}
