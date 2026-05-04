import type { FastifyInstance } from 'fastify';
import { createHmac, timingSafeEqual } from 'crypto';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/webhook/github', async (req, reply) => {
    // Verify webhook signature from GitHub
    const signature = req.headers['x-hub-signature-256'] as string;
    const secret = process.env['GITHUB_WEBHOOK_SECRET'] ?? '';
    const body = JSON.stringify(req.body);

    const expected = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');

    try {
      if (!timingSafeEqual(Buffer.from(signature ?? ''), Buffer.from(expected))) {
        return reply.status(401).send({ success: false, error: { message: 'Invalid signature' } });
      }
    } catch {
      return reply.status(401).send({ success: false, error: { message: 'Invalid signature' } });
    }

    const event = req.headers['x-github-event'] as string;
    const payload = req.body as Record<string, unknown>;

    app.log.info({ event }, 'GitHub webhook received');

    if (event === 'push') {
      const branch = (payload['ref'] as string)?.replace('refs/heads/', '');
      const repoUrl = (payload['repository'] as Record<string, unknown>)?.['html_url'] as string;
      const commits = payload['commits'] as Array<Record<string, unknown>>;
      const latestCommit = commits?.[0];

      app.log.info({ branch, repoUrl, commitSha: latestCommit?.['id'] }, 'Push event received — triggering deployment');

      // Notify API service to create a deployment
      await fetch(`${process.env['API_SERVICE_URL']}/deployments/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          branch,
          commitSha: latestCommit?.['id'],
          commitMessage: latestCommit?.['message'],
        }),
      }).catch((err) => app.log.error(err, 'Failed to notify API service'));
    }

    return reply.send({ success: true });
  });
}
