import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { PackalinkConfig } from '../define-config.js';
import { $ } from '../utils/$.js';
import { getPackageJson } from '../utils/get-package-json.js';
import { log } from '../utils/log.js';

import { processAdditionalDeps } from './process-additional-deps.js';
import { processDedupePeers } from './process-dedupe-peers.js';
import { processLink } from './process-link.js';

const VITE_DEDUPE_PEERS = [
  'mobx',
  'mobx-react-lite',
  'mobx-react',
  'react',
  'react-dom',
  'react-native',
  'preact',
] as const;

const warnAboutViteDedupe = (
  projectDir: string,
  proceedLinks: Array<{ packageName: string; targetDirForLinking: string }>,
) => {
  const projectPackageJsonPath = path.resolve(projectDir, './package.json');
  const hasViteConfig =
    existsSync(path.resolve(projectDir, './vite.config.ts')) ||
    existsSync(path.resolve(projectDir, './vite.config.js')) ||
    existsSync(path.resolve(projectDir, './vite.config.mjs'));

  if (!existsSync(projectPackageJsonPath) && !hasViteConfig) {
    return;
  }

  let projectPackageJson: Record<string, any> = {};
  if (existsSync(projectPackageJsonPath)) {
    projectPackageJson = getPackageJson({
      packageDescription: 'project',
      pathWhereContainsPackageJson: projectDir,
      ignoreFilesCheck: true,
    });
  }

  const projectDependencies = {
    ...projectPackageJson.dependencies,
    ...projectPackageJson.devDependencies,
    ...projectPackageJson.peerDependencies,
  };
  const usesVite = hasViteConfig || Object.hasOwn(projectDependencies, 'vite');

  if (!usesVite) {
    return;
  }

  const peerNames = new Set<string>();
  proceedLinks.forEach((proceedLink) => {
    const packageJson = getPackageJson({
      packageDescription: proceedLink.packageName,
      pathWhereContainsPackageJson: proceedLink.targetDirForLinking,
      ignoreFilesCheck: true,
    });

    VITE_DEDUPE_PEERS.forEach((peerName) => {
      if (Object.hasOwn(packageJson.peerDependencies ?? {}, peerName)) {
        peerNames.add(peerName);
      }
    });
  });

  if (peerNames.size === 0) {
    return;
  }

  const dedupe = JSON.stringify([...peerNames]);
  log(
    `Vite обнаружен. Для исключения duplicate dependencies добавь в vite.config:`,
    { type: 'warn' },
  );
  log('resolve: {', { type: 'warn', nested: true });
  log(`  dedupe: ${dedupe},`, { type: 'warn', nested: true });
  log('}', { type: 'warn', nested: true });
};

export const run = (config: PackalinkConfig) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const linkerDir = path.resolve(__dirname);
  const projectDir = config.sourceDirForLinking ?? process.cwd();

  const linkerPackageJson = getPackageJson({
    packageDescription: `packalink`,
    pathWhereContainsPackageJson: linkerDir,
    ignoreFilesCheck: true,
  });

  const linkerVersion = linkerPackageJson.version ?? 'unknown';

  log(`[packalink]`, { isGroupStart: true });
  log('версия:', { data: linkerVersion });
  log('директория:', { data: linkerDir });
  log(`[packalink]`, { isGroupEnd: true });

  log('Рабочая директория:', { data: projectDir });

  /**
   * @example /home/username/projects/js2me-kit
   */
  const targetDirForLinking =
    config.targetDirForLinking && path.resolve(config.targetDirForLinking);

  if (targetDirForLinking && !existsSync(targetDirForLinking)) {
    throw log(
      `Не удалось найти директорию для линковки ${config.targetDirForLinking}`,
      {
        type: 'error',
      },
    );
  }

  if (config.links.length === 0) {
    log('Список линков не найден', { type: 'warn' });
    return;
  }

  const viteCacheDir = path.resolve(projectDir, './node_modules/.vite');

  if (existsSync(viteCacheDir)) {
    log('Очищаем кэш Vite', { level: 1 });

    $(`rm -rf ${viteCacheDir}`, {
      safe: true,
      onSucceed: () => {
        log('Успешно', {
          nested: true,
          type: 'success',
        });
      },
      onFailed: (e) => {
        log('Неудача', {
          nested: true,
          type: 'error',
          data: e,
        });
      },
    });
  }

  const proceedLinks = config.links.map((link) => {
    const linkDetails =
      typeof link === 'string'
        ? {
            packageName: link,
          }
        : link;

    return processLink(projectDir, config, linkDetails);
  });

  warnAboutViteDedupe(projectDir, proceedLinks);

  proceedLinks.forEach((proceedLink) => {
    processAdditionalDeps(projectDir, config, proceedLink, proceedLinks);
    processDedupePeers(proceedLink, proceedLinks);
  });
};
