import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(scriptDir, '..');

function getEnvFiles() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const envFiles = [`.env.${nodeEnv}.local`];

  if (nodeEnv !== 'test') {
    envFiles.push('.env.local');
  }

  envFiles.push(`.env.${nodeEnv}`, '.env');
  return envFiles;
}

export function loadRootEnv() {
  for (const relativePath of getEnvFiles()) {
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
