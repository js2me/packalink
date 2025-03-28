import {
  defineConfig,
  type PackalinkConfig,
  type PackalinkLink,
} from './define-config.js';
import { run as runFn } from './run/index.js';

export { runFn as run };
export { defineConfig };
export type { PackalinkConfig, PackalinkLink };
