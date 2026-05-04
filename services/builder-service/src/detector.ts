import fs from 'fs';
import path from 'path';

export type Framework = 'nextjs' | 'react' | 'vue' | 'static' | 'unknown';

export interface BuildConfig {
  framework: Framework;
  installCmd: string;
  buildCmd: string;
  outputDir: string;
}

export function detectFramework(repoPath: string): BuildConfig {
  const pkg = path.join(repoPath, 'package.json');

  if (!fs.existsSync(pkg)) {
    return { framework: 'static', installCmd: '', buildCmd: '', outputDir: '.' };
  }

  const json = JSON.parse(fs.readFileSync(pkg, 'utf-8')) as Record<string, unknown>;
  const deps = { ...json['dependencies'] as object, ...json['devDependencies'] as object } as Record<string, string>;

  if (deps['next']) {
    return { framework: 'nextjs', installCmd: 'npm install', buildCmd: 'npm run build', outputDir: '.next' };
  }
  if (deps['vue']) {
    return { framework: 'vue', installCmd: 'npm install', buildCmd: 'npm run build', outputDir: 'dist' };
  }
  if (deps['react'] || deps['react-dom']) {
    return { framework: 'react', installCmd: 'npm install', buildCmd: 'npm run build', outputDir: 'build' };
  }

  return { framework: 'unknown', installCmd: 'npm install', buildCmd: 'npm run build', outputDir: 'dist' };
}
