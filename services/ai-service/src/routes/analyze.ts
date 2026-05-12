import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { analyzeError } from '../lib/analyzer';

const API_URL = process.env['API_SERVICE_URL'] ?? 'http://localhost:4001';

const analyzeSchema = z.object({
  deploymentId: z.string(),
  error: z.string(),
  isPaid: z.boolean().optional().default(false),
});

export async function analyzeRoutes(app: FastifyInstance) {
  app.post('/ai/analyze', async (req, reply) => {
    const result = analyzeSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { message: result.error.message } });
    }

    const { deploymentId, error, isPaid } = result.data;

    // Run analysis in background — builder-service does not wait for this
    analyzeError({ deploymentId, errorLogs: error, isPaid })
      .then(async (output) => {
        const explanation = [
          `**Error Type:** ${output.errorType}`,
          `**Explanation:** ${output.result.explanation}`,
          output.result.fixSteps.length > 0
            ? `**Fix Steps:**\n${output.result.fixSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
            : '',
          output.result.autoFixable && output.result.fixCommand
            ? `**Auto-fix Command:** \`${output.result.fixCommand}\``
            : '',
          `*(Analyzed in ${output.attempts} attempt${output.attempts > 1 ? 's' : ''})*`,
        ].filter(Boolean).join('\n\n');

        await fetch(`${API_URL}/deployments/${deploymentId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'failed', aiErrorExplanation: explanation }),
        });
      })
      .catch((err) => {
        app.log.error(`AI analysis failed for deployment ${deploymentId}: ${err}`);
      });

    // Respond immediately — analysis runs async
    return reply.send({ success: true, data: { message: 'Analysis started' } });
  });

  app.get('/ai/health', async () => ({
    status: 'ok',
    service: 'ai-service',
    providers: {
      groq: !!process.env['GROQ_API_KEY'],
      claude: !!process.env['CLAUDE_API_KEY'],
    },
  }));
}
