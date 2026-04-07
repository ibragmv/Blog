import { spawnSync } from 'node:child_process';

const [, , taskName, ...forwardedArgs] = process.argv;

const turboTasks = {
  build: {
    direct: [['bunx', 'next', 'build', '--turbopack']],
    turbo: ['bunx', 'turbo', 'run', 'build', '--filter=//', '--ui=stream'],
  },
  clean: {
    direct: [['rm', '-rf', '.next']],
    turbo: ['bunx', 'turbo', 'run', 'clean', '--continue', '--ui=stream'],
    afterTurbo: [['rm', '-rf', '.turbo', '.vercel']],
  },
  dev: {
    direct: [['bunx', 'next', 'dev', '--turbopack']],
    turbo: ['bunx', 'turbo', 'run', 'dev', '--filter=//', '--ui=stream'],
  },
  lint: {
    direct: [
      ['bunx', 'biome', 'check', '.'],
      ['bun', 'run', 'convex'],
    ],
    turbo: ['bunx', 'turbo', 'run', 'lint', '--filter=//', '--ui=stream'],
  },
  start: {
    direct: [['bunx', 'next', 'start']],
    turbo: ['bunx', 'turbo', 'run', 'start', '--filter=//', '--ui=stream'],
  },
  typecheck: {
    direct: [['bun', 'scripts/typecheck.mjs']],
    turbo: ['bunx', 'turbo', 'run', 'typecheck', '--filter=//', '--ui=stream'],
  },
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runCommands(commands) {
  for (const [command, ...args] of commands) {
    run(command, args);
  }
}

const targetTask = turboTasks[taskName];

if (!targetTask) {
  process.stderr.write(`Unknown Turbo task wrapper: ${taskName}\n`);
  process.exit(1);
}

const isTurboRuntime = Boolean(process.env.TURBO_HASH);

if (isTurboRuntime) {
  runCommands(targetTask.direct);
  process.exit(0);
}

run(targetTask.turbo[0], [...targetTask.turbo.slice(1), ...forwardedArgs]);

if (targetTask.afterTurbo) {
  runCommands(targetTask.afterTurbo);
}
