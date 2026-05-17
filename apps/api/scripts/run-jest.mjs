#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function buildJestArgs(rawArgs) {
  const filteredArgs = rawArgs.filter((arg) => arg !== '--');

  // Default to in-band execution for CI/local stability, while still allowing explicit override flags.
  const hasExplicitRunInBandSetting = filteredArgs.some((arg) =>
    arg === '-i' || /^--runInBand(?:=(?:true|false))?$/i.test(arg)
  );

  return hasExplicitRunInBandSetting ? filteredArgs : ['--runInBand', ...filteredArgs];
}

function run() {
  const rawArgs = process.argv.slice(2);
  const jestArgs = buildJestArgs(rawArgs);

  // Resolve jest binary from node_modules
  const jestBin = resolve(__dirname, '../node_modules/.bin/jest');
  const result = spawnSync(process.execPath, [jestBin, ...jestArgs], {
    stdio: 'inherit',
  });

  if (typeof result.status === 'number') {
    process.exit(result.status);
  }

  if (result.error) {
    throw result.error;
  }

  if (result.signal) {
    process.kill(process.pid, result.signal);
    return;
  }

  process.exit(1);
}

export { buildJestArgs };

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
