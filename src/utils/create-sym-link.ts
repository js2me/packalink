import fs from 'node:fs';
import path from 'node:path';

import { $ } from './$.js';
import { log } from './log.js';

export const createSymlink = ({
  name,
  targetPath,
  sourcePath,
  /**
   * Allow creating a symlink at a path that does not exist yet
   * (mkdir parent, rm target, then ln -s).
   */
  createIfMissing,
}: {
  name: string;
  /**
   * Место куда будет помещена симв. ссылка
   */
  targetPath: string;
  /** Исходный файл на который будет ссылаться симлинк */
  sourcePath: string;
  createIfMissing?: boolean;
}) => {
  log(`${name} создание симв. ссылки`, { isGroupStart: true });

  if (!fs.existsSync(sourcePath)) {
    return log(`"${sourcePath}" не существует. Процесс будет пропущен`, {
      type: 'warn',
      isGroupEnd: true,
    });
  }

  if (!createIfMissing && !fs.existsSync(targetPath)) {
    return log(`"${targetPath}" не существует. Процесс будет пропущен`, {
      type: 'warn',
      isGroupEnd: true,
    });
  }

  if (createIfMissing) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }

  $(`rm -rf ${targetPath}`);

  $(`ln -s ${sourcePath} ${targetPath}`, {
    safe: true,
    onSucceed: () => {
      log(`${name} симв. ссылка создана`, { isGroupEnd: true });
    },
    onFailed: (e) => {
      log(`${name} не удалось создать симв. ссылку`, {
        isGroupEnd: true,
        data: e,
        type: 'error',
      });
    },
  });
};
