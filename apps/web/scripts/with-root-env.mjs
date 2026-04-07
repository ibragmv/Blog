import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(workspaceRoot, '..', '..');

function getRootEnvFiles() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const envFiles = [`.env.${nodeEnv}.local`];

  if (nodeEnv !== 'test') {
    envFiles.push('.env.local');
  }

  envFiles.push(`.env.${nodeEnv}`, '.env');
  return envFiles;
}

export function loadRootEnv() {
  for (const relativePath of getRootEnvFiles()) {
    const absolutePath = path.join(repoRoot, relativePath);

    if (!existsSync(absolutePath)) {
      continue;
    }

    const parsed = parseEnv(readFileSync(absolutePath, 'utf8'));

    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

export function runWithRootEnv(command, args, options = {}) {
  loadRootEnv();

  const result = spawnSync(command, args, {
    cwd: options.cwd ?? workspaceRoot,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (import.meta.main) {
  const [, , command, ...args] = process.argv;

  if (!command) {
    process.stderr.write('Usage: bun scripts/with-root-env.mjs <command> [...args]\n');
    process.exit(1);
  }

  runWithRootEnv(command, args);
}
