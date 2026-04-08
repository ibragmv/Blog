import { spawnSync } from 'node:child_process';
import { ensureConvexTmpDir, loadRootEnv, repoRoot } from './root-env.mjs';

loadRootEnv();
ensureConvexTmpDir();

const [, , ...forwardedArgs] = process.argv;
const result = spawnSync(
  'bunx',
  [
    'convex',
    'deploy',
    '--cmd',
    'bun run build:web',
    '--cmd-url-env-var-name',
    'NEXT_PUBLIC_CONVEX_URL',
    ...forwardedArgs,
  ],
  {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
