import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

export interface AnalysisResult {
  errorType: string;
  explanation: string;
  fixSteps: string[];
  autoFixable: boolean;
  fixCommand: string | null;
}

export async function analyzeWithGroq(
  errorLogs: string,
  contextFile: string,
  attempt: number,
): Promise<AnalysisResult> {
  const prompt = buildPrompt(errorLogs, contextFile, attempt);

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert DevOps engineer specializing in Node.js build failures.
You will be given build error logs and a knowledge base document.
Always respond with valid JSON matching the specified schema. Be specific and actionable.`,
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content ?? '{}';
  return parseResponse(content);
}

function buildPrompt(logs: string, context: string, attempt: number): string {
  return `## Knowledge Base
${context}

## Build Error Logs (Attempt ${attempt}/3)
\`\`\`
${logs.slice(-3000)}
\`\`\`

## Task
Analyze the build error using the knowledge base above. Return JSON:
{
  "errorType": "one of: dependency|memory|typescript|missing-env|framework|general",
  "explanation": "clear explanation of what went wrong and why",
  "fixSteps": ["step 1", "step 2", "..."],
  "autoFixable": true/false,
  "fixCommand": "exact command to fix, or null if not auto-fixable"
}`;
}

function parseResponse(content: string): AnalysisResult {
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
