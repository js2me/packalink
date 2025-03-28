import { existsSync } from 'node:fs';
import path from 'node:path';

import { PackalinkConfig } from '../define-config.js';
import { createSymlink } from '../utils/create-sym-link.js';
import { getPackageJson } from '../utils/get-package-json.js';
import { log } from '../utils/log.js';

import { ProceedPackalinkLink, scanDirForDep } from './process-link.js';

export const processAdditionalDeps = (
  projectDir: string,
  config: PackalinkConfig,
  proceedLink: ProceedPackalinkLink,
  otherProceedLinks: ProceedPackalinkLink[],
) => {
  if (proceedLink.additionalDepsToLink?.length) {
    proceedLink.additionalDepsToLink.forEach((packageName) => {
      log(
        `${packageName} линковка (вложенная зависимость у ${proceedLink.packageName})`,
        {
          level: 3,
          nextLevel: 4,
        },
      );

      const foundExistingProceedLink = otherProceedLinks.find(
        (link) => link.packageName === packageName,
      );

      const packageToLinkDir = path.resolve(
        proceedLink.linkDepsNodeModulesPath,
        `./${packageName}`,
      );

      const targetDirForLinking =
        foundExistingProceedLink?.targetDirForLinking ??
        path.resolve(proceedLink.nodeModulesPath, `./${packageName}`);

      if (!existsSync(packageToLinkDir)) {
        log(
          `Не удалось найти зависимость "${packageName}" установленную для "${proceedLink.packageName}" пакета`,
          {
            type: 'warn',
          },
        );
        return;
      }

      const packageJson = getPackageJson({
        packageDescription: packageName,
        pathWhereContainsPackageJson: packageToLinkDir,
      });

      const itemsInDepDir = scanDirForDep(packageToLinkDir, packageName);

      if (packageJson.files?.length) {
        packageJson.files.forEach((file: string) => {
          if (file === '*') {
            if (itemsInDepDir.length > 0) {
              itemsInDepDir.forEach((item: string) => {
                createSymlink({
                  name: `${packageName}(${item})`,
                  targetPath: path.resolve(targetDirForLinking, `./${item}`),
                  sourcePath: path.resolve(packageToLinkDir, `./${item}`),
                });
              });
            }
          } else {
            createSymlink({
              name: `${packageName}(${file})`,
              targetPath: path.resolve(targetDirForLinking, `./${file}`),
              sourcePath: path.resolve(packageToLinkDir, `./${file}`),
            });
          }
        });
      } else if (itemsInDepDir.length > 0) {
        itemsInDepDir.forEach((item: string) => {
          createSymlink({
            name: `${packageName}(${item})`,
            targetPath: path.resolve(targetDirForLinking, `./${item}`),
            sourcePath: path.resolve(packageToLinkDir, `./${item}`),
          });
        });
      }

      log(`${packageName} линковка завершена`, {
        type: 'success',
        nextLevel: 3,
      });
    });
  }
};
