import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PackalinkConfig } from '../define-config.js';
import { $ } from '../utils/$.js';
import { getPackageJson } from '../utils/get-package-json.js';
import { log } from '../utils/log.js';

import { processLink } from './process-link.js';

export const run = (config: PackalinkConfig) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const linkerDir = path.resolve(__dirname, '../..');
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
   * @example /home/username/projects/one-web-kit
   */
  const targetDirForLinking = path.resolve(config.targetDirForLinking);

  if (!existsSync(targetDirForLinking)) {
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

  config.links.forEach((link) => {
    const linkDetails =
      typeof link === 'string'
        ? {
            packageName: link,
          }
        : link;

    processLink(projectDir, config, linkDetails);
  });
};
