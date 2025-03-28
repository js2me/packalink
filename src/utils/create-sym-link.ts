import fs from 'node:fs';

import { $ } from './$.js';
import { log } from './log.js';

export const createSymlink = ({
  name,
  current,
  target,
}: {
  name: string;
  current: string;
  target: string;
}) => {
  log(`${name} создание симв. ссылки`, { isGroupStart: true });

  if (!fs.existsSync(current)) {
    return log(`"${current}" не существует. Процесс будет пропущен`, {
      type: 'warn',
    });
  }

  if (!fs.existsSync(target)) {
    return log(`"${target}" не существует. Процесс будет пропущен`, {
      type: 'warn',
    });
  }

  $(`rm -rf ${current}`);
  $(`ln -s ${target} ${current}`, {
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
