import { ConfigsManager } from 'sborshik/utils';
import { defineLibViteConfig } from 'sborshik/vite';

export default defineLibViteConfig(ConfigsManager.create(), {
  binPath: 'bin.js',
  externalDeps: ['node:child_process', 'node:fs', 'node:path', 'node:url'],
  omitStrangeExportEntries: true,
});
