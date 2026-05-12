import fs from 'fs';
import path from 'path';
import type { ErrorType } from './classifier';

const CONTEXT_DIR = path.join(process.cwd(), 'context');

const CONTEXT_FILES: Record<ErrorType, string> = {
  'dependency':      'dependency-errors.md',
  'memory':          'memory-limit-errors.md',
  'typescript':      'typescript-errors.md',
  'missing-env':     'missing-env-errors.md',
  'framework-nextjs': 'framework/nextjs.md',
  'framework-react': 'framework/react.md',
  'framework-vue':   'framework/vue.md',
  'general':         'general.md',
};

export function loadContext(errorType: ErrorType): string {
  const filename = CONTEXT_FILES[errorType];
  const filePath = path.join(CONTEXT_DIR, filename);

  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    const fallback = path.join(CONTEXT_DIR, 'general.md');
    return fs.readFileSync(fallback, 'utf-8');
  }
}
