import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadRootEnv, runWithRootEnv } from './with-root-env.mjs';

const cwd = process.cwd();
const convexCodegenScript = path.resolve(cwd, '../../scripts/convex-codegen.mjs');
const convexGeneratedDir = path.resolve(cwd, '../../convex/_generated');
const convexGeneratedFiles = [
  'api.d.ts',
  'api.js',
  'dataModel.d.ts',
  'server.d.ts',
  'server.js',
];

loadRootEnv();

const hasGeneratedBindings =
  existsSync(convexGeneratedDir) &&
  convexGeneratedFiles.every((filename) => existsSync(path.join(convexGeneratedDir, filename)));

if (!process.env.CONVEX_SITE_URL || !hasGeneratedBindings) {
  runWithRootEnv('bun', [convexCodegenScript], { cwd });
}

runWithRootEnv('bunx', ['next', 'build', '--turbopack'], { cwd });
