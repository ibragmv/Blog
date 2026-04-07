import { spawnSync } from 'node:child_process';

const [, , taskName, ...forwardedArgs] = process.argv;

const turboTasks = {
  clean: {
    direct: [['rm', '-rf', '.turbo', '.vercel']],
    turbo: ['bunx', 'turbo', 'run', 'clean', '--continue', '--ui=stream'],
  },
  lint: {
    direct: [
      [
        'bunx',
        'biome',
        'check',
        '.env.example',
        '.github',
        '.gitignore',
        'README.md',
        'biome.json',
        'convex.json',
        'eslint.config.mjs',
        'package.json',
        'scripts',
        'tsconfig.json',
        'turbo.json',
        'vercel.json',
      ],
      ['bun', 'run', 'convex'],
    ],
    turbo: ['bunx', 'turbo', 'run', 'lint', '--continue', '--ui=stream'],
  },
  typecheck: {
    direct: [['bun', 'scripts/typecheck-root.mjs']],
    turbo: ['bunx', 'turbo', 'run', 'typecheck', '--continue', '--ui=stream'],
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
