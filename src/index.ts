import {
  defineConfig,
  type PackalinkConfig,
  type PackalinkLink,
} from './define-config.js';
import { run as runFn } from './run/index.js';

export type { PackalinkConfig, PackalinkLink };
export { defineConfig, runFn as run };
