#!/usr/bin/env node

import { existsSync } from 'node:fs';
import path from 'node:path';

import { PackalinkConfig } from './define-config';
import { run } from './run/index.js';

const projectDir = process.cwd();

let packalinkConfig: PackalinkConfig;

if (existsSync(path.resolve(projectDir, 'packalink.config.mjs'))) {
  packalinkConfig = await import(
    path.resolve(projectDir, 'packalink.config.mjs')
  );
} else if (existsSync(path.resolve(projectDir, 'packalink.config.json'))) {
  packalinkConfig = await import(
    path.resolve(projectDir, 'packalink.config.json')
  );
} else {
  throw new Error('packalink.config.mjs or packalink.config.json not found');
}

run(packalinkConfig);
