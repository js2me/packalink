#!/usr/bin/env node

import { existsSync } from 'node:fs';
import path from 'node:path';

import type { PackalinkConfig } from './define-config';
import { run } from './run/index.js';

const main = async () => {
  const projectDir = process.cwd();

  let packalinkConfig: PackalinkConfig;

  let module: any;

  if (existsSync(path.resolve(projectDir, 'packalink.config.js'))) {
    module = await import(path.resolve(projectDir, 'packalink.config.js'));
  } else if (existsSync(path.resolve(projectDir, 'packalink.config.mjs'))) {
    module = await import(path.resolve(projectDir, 'packalink.config.mjs'));
  } else if (existsSync(path.resolve(projectDir, 'packalink.config.json'))) {
    module = await import(path.resolve(projectDir, 'packalink.config.json'));
  } else {
    throw new Error('packalink.config.(js|mjs|json) not found');
  }

  if (module.default && 'links' in module.default) {
    packalinkConfig = module.default;
  } else {
    throw new Error('packalink.config.(js|mjs|json) is not valid');
  }

  run(packalinkConfig);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
