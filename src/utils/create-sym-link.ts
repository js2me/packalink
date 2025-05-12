import fs from 'node:fs';

import { $ } from './$.js';
import { log } from './log.js';

export const createSymlink = ({
  name,
  targetPath,
  sourcePath,
  raw,
}: {
  name: string;
  /**
   * Место куда будет помещена симв. ссылка
   */
  targetPath: string;
  /** Исходный файл на который будет ссылаться симлинк */
  sourcePath: string;
  /**
   * ТОЛЬКО КОМАНДА ln -s
   */
  raw?: boolean;
}) => {
  log(`${name} создание симв. ссылки`, { isGroupStart: true });

  if (!raw) {
    if (!fs.existsSync(targetPath)) {
      return log(`"${targetPath}" не существует. Процесс будет пропущен`, {
        type: 'warn',
      });
    }

    if (!fs.existsSync(sourcePath)) {
      return log(`"${sourcePath}" не существует. Процесс будет пропущен`, {
        type: 'warn',
      });
    }

    $(`rm -rf ${targetPath}`);
  }

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
