import path from 'node:path';
import { loadRootEnv, runWithRootEnv } from './with-root-env.mjs';

const cwd = process.cwd();
const convexCodegenScript = path.resolve(cwd, '../../scripts/convex-codegen.mjs');

loadRootEnv();
runWithRootEnv('bun', [convexCodegenScript], { cwd });
runWithRootEnv('bunx', ['next', 'build', '--turbopack'], { cwd });
