import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { detectFramework } from './detector';
import { runBuild } from './docker';

const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
const API_URL   = process.env['API_SERVICE_URL'] ?? 'http://localhost:4001';

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

export function startWorker() {
  const worker = new Worker('builds', async (job) => {
    const { deploymentId, repoUrl, branch } = job.data as {
      deploymentId: string;
      repoUrl: string;
      branch: string;
    };

    const publish = (line: string) => {
      redis.publish(`deployment:${deploymentId}`, JSON.stringify({ line, timestamp: new Date() }));
    };

    publish(`[intellideploy] Starting build for ${repoUrl} on branch ${branch}`);

    // Update deployment status to building
    await fetch(`${API_URL}/deployments/${deploymentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'building' }),
    });

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'intellideploy-'));

    try {
      // Clone repo
      publish(`[intellideploy] Cloning repository...`);
      execSync(`git clone --branch ${branch} --depth 1 ${repoUrl} ${tmpDir}`, { stdio: 'pipe' });
      publish(`[intellideploy] Repository cloned successfully`);

      // Detect framework
      const config = detectFramework(tmpDir);

      // Run build inside Docker
      const startTime = Date.now();
      await runBuild(tmpDir, config, publish);
      const buildDuration = Math.floor((Date.now() - startTime) / 1000);

      // Update deployment as success
      await fetch(`${API_URL}/deployments/${deploymentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'success', buildDuration }),
      });

      publish(`[intellideploy] Deployment successful — live in seconds`);

    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      publish(`[intellideploy] Build failed: ${error}`);

      // Notify AI service for error analysis
      fetch(`${process.env['AI_SERVICE_URL'] ?? 'http://localhost:4005'}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deploymentId, error }),
      }).catch(() => null);

      await fetch(`${API_URL}/deployments/${deploymentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed' }),
      });

      throw err;
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }, {
    connection: { host: 'localhost', port: 6379 },
    concurrency: 3,
  });

  worker.on('completed', (job) => console.log(`Build ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`Build ${job?.id} failed:`, err.message));

  return worker;
}
