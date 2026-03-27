import { spawn } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const envLocalPath = path.join(cwd, '.env.local');
const args = ['convex', 'dev', '--env-file', '.env', ...process.argv.slice(2)];

function removeEnvLocal() {
  if (!existsSync(envLocalPath)) {
    return;
  }

  try {
    unlinkSync(envLocalPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Failed to remove .env.local: ${message}`);
  }
}

const child = spawn('bunx', args, {
  cwd,
  env: process.env,
  stdio: 'inherit',
});

const cleanupInterval = setInterval(removeEnvLocal, 250);
removeEnvLocal();

const forwardSignal = (signal) => {
  child.kill(signal);
};

process.on('SIGINT', forwardSignal);
process.on('SIGTERM', forwardSignal);

child.on('exit', (code, signal) => {
  clearInterval(cleanupInterval);
  removeEnvLocal();

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
