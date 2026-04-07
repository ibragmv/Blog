import { spawnSync } from 'node:child_process';
import { loadRootEnv } from './root-env.mjs';

loadRootEnv();

const codegenResult = spawnSync('bun', ['scripts/convex-codegen.mjs'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
});

if (codegenResult.status !== 0) {
  process.exit(codegenResult.status ?? 1);
}

const result = spawnSync(
  'bunx',
  ['tsc', '--noEmit', '--pretty', 'false', '--project', 'convex/tsconfig.json'],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
