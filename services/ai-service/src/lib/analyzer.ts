import { classifyError } from './classifier';
import { loadContext } from './context';
import { analyzeWithGroq } from './groq';
import { analyzeWithClaude } from './claude';
import type { AnalysisResult } from './groq';

const MAX_ATTEMPTS = 3;

export interface AnalyzerInput {
  deploymentId: string;
  errorLogs: string;
  isPaid: boolean;
}

export interface AnalyzerOutput {
  deploymentId: string;
  attempts: number;
  errorType: string;
  result: AnalysisResult;
}

export async function analyzeError(input: AnalyzerInput): Promise<AnalyzerOutput> {
  const { deploymentId, errorLogs, isPaid } = input;

  const errorType = classifyError(errorLogs);
  const contextFile = loadContext(errorType);

  let lastResult: AnalysisResult | null = null;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;

    try {
      const result = isPaid
        ? await analyzeWithClaude(errorLogs, contextFile, attempt)
        : await analyzeWithGroq(errorLogs, contextFile, attempt);

      lastResult = result;

      // If we got a meaningful explanation, stop retrying
      if (result.explanation && result.explanation.length > 50) {
        break;
      }
    } catch (err) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      if (isLastAttempt) {
        lastResult = {
          errorType,
          explanation: `AI analysis failed after ${MAX_ATTEMPTS} attempts. Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          fixSteps: ['Check the build logs manually for the root cause'],
          autoFixable: false,
          fixCommand: null,
        };
      }
      // Otherwise continue to next attempt
    }
  }

  return {
    deploymentId,
    attempts: attempt,
    errorType,
    result: lastResult ?? {
      errorType,
      explanation: 'Unable to analyze error.',
      fixSteps: [],
      autoFixable: false,
      fixCommand: null,
    },
  };
}
