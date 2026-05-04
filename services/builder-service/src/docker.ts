import Docker from 'dockerode';
import path from 'path';
import type { BuildConfig } from './detector';

const docker = new Docker();

export async function runBuild(
  repoPath: string,
  config: BuildConfig,
  onLog: (line: string) => void,
): Promise<void> {
  const commands = [
    config.installCmd,
    config.buildCmd,
  ].filter(Boolean).join(' && ');

  onLog(`[intellideploy] Framework detected: ${config.framework}`);
  onLog(`[intellideploy] Running: ${commands}`);

  const container = await docker.createContainer({
    Image: 'node:20-alpine',
    Cmd: ['sh', '-c', commands],
    WorkingDir: '/app',
    HostConfig: {
      Binds: [`${path.resolve(repoPath)}:/app`],
      Memory: 512 * 1024 * 1024, // 512MB limit
      NetworkMode: 'none',        // No network access during build
    },
    Env: ['NODE_ENV=production'],
  });

  await container.start();

  const stream = await container.logs({ follow: true, stdout: true, stderr: true });

  await new Promise<void>((resolve, reject) => {
    docker.modem.demuxStream(
      stream,
      {
        write: (chunk: Buffer) => {
          chunk.toString().split('\n').filter(Boolean).forEach((line) => onLog(line));
        },
      },
      {
        write: (chunk: Buffer) => {
          chunk.toString().split('\n').filter(Boolean).forEach((line) => onLog(`[stderr] ${line}`));
        },
      },
    );
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  const info = await container.wait();
  await container.remove();

  if (info.StatusCode !== 0) {
    throw new Error(`Build failed with exit code ${info.StatusCode}`);
  }

  onLog(`[intellideploy] Build completed successfully`);
}
