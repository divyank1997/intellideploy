import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult } from './groq';

const anthropic = new Anthropic({ apiKey: process.env['CLAUDE_API_KEY'] });

export async function analyzeWithClaude(
  errorLogs: string,
  contextFile: string,
  attempt: number,
): Promise<AnalysisResult> {
  const prompt = `## Knowledge Base
${contextFile}

## Build Error Logs (Attempt ${attempt}/3)
\`\`\`
${errorLogs.slice(-4000)}
\`\`\`

## Task
Analyze the build error using the knowledge base above. Return JSON only:
{
  "errorType": "one of: dependency|memory|typescript|missing-env|framework|general",
  "explanation": "clear explanation of what went wrong and why",
  "fixSteps": ["step 1", "step 2", "..."],
  "autoFixable": true/false,
  "fixCommand": "exact command to fix, or null if not auto-fixable"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are an expert DevOps engineer specializing in Node.js build failures.
Analyze build errors using the provided knowledge base and give precise, actionable fixes.
Always respond with valid JSON only. No markdown, no explanation outside JSON.`,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0]?.type === 'text' ? response.content[0].text : '{}';

  try {
    const parsed = JSON.parse(content) as Partial<AnalysisResult>;
    return {
      errorType: parsed.errorType ?? 'general',
      explanation: parsed.explanation ?? 'Build failed. Check logs for details.',
      fixSteps: Array.isArray(parsed.fixSteps) ? parsed.fixSteps : [],
      autoFixable: parsed.autoFixable ?? false,
      fixCommand: parsed.fixCommand ?? null,
    };
  } catch {
    return {
      errorType: 'general',
      explanation: content,
      fixSteps: [],
      autoFixable: false,
      fixCommand: null,
    };
  }
}
