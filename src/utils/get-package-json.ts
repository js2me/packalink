import { AnyObject } from 'yummies/utils/types';

import fs from 'node:fs';
import path from 'node:path';

import { log } from './log.js';

export const getPackageJson = ({
  packageDescription,
  pathWhereContainsPackageJson,
  ignoreFilesCheck,
}: {
  packageDescription: string;
  pathWhereContainsPackageJson: string;
  ignoreFilesCheck?: boolean;
}): AnyObject => {
  const packageJsonPath = path.resolve(
    pathWhereContainsPackageJson,
    './package.json',
  );
  const packageJsonString = fs.readFileSync(packageJsonPath)?.toString();

  if (!packageJsonString) {
    throw log(
      `Не удалось найти "package.json" для зависимости "${packageDescription}" (путь: ${pathWhereContainsPackageJson})`,
      { type: 'error' },
    );
  }

  const packageJson = JSON.parse(packageJsonString);

  if (!ignoreFilesCheck && !packageJson?.files?.length) {
    log(
      `Свойство "files" отсутствует в "package.json" для "${packageJson.name}"`,
      { type: 'warn' },
    );
  }

  return packageJson;
};
