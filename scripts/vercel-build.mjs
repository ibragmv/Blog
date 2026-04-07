import { spawnSync } from 'node:child_process';
import { repoRoot } from './root-env.mjs';

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const deployKey = process.env.CONVEX_DEPLOY_KEY?.trim();
const vercelEnv = process.env.VERCEL_ENV;

if (deployKey) {
  if (vercelEnv === 'production' && deployKey.startsWith('preview:')) {
    process.stderr.write(
      '[vercel-build] Refusing to use a Convex preview deploy key for a production Vercel deployment.\n'
    );
    process.exit(1);
  }

  if (vercelEnv === 'preview' && deployKey.startsWith('prod:')) {
    process.stderr.write(
      '[vercel-build] Warning: preview deployment is using a production Convex deploy key. Add a preview-scoped CONVEX_DEPLOY_KEY in Vercel Preview env if you want isolated preview backends.\n'
    );
  }

  run('bun', ['scripts/convex-deploy.mjs']);
  process.exit(0);
}

const target = vercelEnv === 'preview' ? 'preview' : 'production';
process.stderr.write(
  `[vercel-build] Missing CONVEX_DEPLOY_KEY for ${target} build. Because convex/_generated is not committed, Vercel must have a deploy key available to run Convex codegen during the build. Add a production key in Vercel Production env, and a preview key in Vercel Preview env.\n`
);
process.exit(1);
