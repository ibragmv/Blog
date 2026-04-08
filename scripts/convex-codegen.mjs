import { spawnSync } from 'node:child_process';
import { ensureConvexTmpDir, loadRootEnv, repoRoot } from './root-env.mjs';

loadRootEnv();
ensureConvexTmpDir();

const result = spawnSync('bunx', ['convex', 'codegen', '--typecheck', 'disable'], {
  cwd: repoRoot,
  env: process.env,
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
