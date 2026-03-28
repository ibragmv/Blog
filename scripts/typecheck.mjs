import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('bunx', ['next', 'typegen']);

const tsconfigPath = path.join(cwd, 'tsconfig.json');
const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
const include = Array.isArray(tsconfig.include) ? tsconfig.include : [];

const filteredInclude = include.filter(
  (entry) => entry !== '.next/types/**/*.ts' && entry !== '.next/dev/types/**/*.ts'
);

const tempTsconfigPath = path.join(cwd, 'tsconfig.typecheck.tmp.json');

writeFileSync(
  tempTsconfigPath,
  JSON.stringify(
    {
      extends: tsconfigPath,
      include: filteredInclude,
    },
    null,
    2
  )
);

try {
  run('bunx', ['tsc', '--noEmit', '--incremental', 'false', '--project', tempTsconfigPath]);
} finally {
  rmSync(tempTsconfigPath, { force: true });
}
