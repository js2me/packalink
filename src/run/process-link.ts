import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { PackalinkConfig, PackalinkLink } from '../define-config.js';
import { createSymlink } from '../utils/create-sym-link.js';
import { getPackageJson } from '../utils/get-package-json.js';
import { log } from '../utils/log.js';

export const processLink = (
  projectDir: string,
  config: PackalinkConfig,
  link: PackalinkLink,
) => {
  log(`${link.packageName} линковка`, { type: 'info', nextLevel: 3 });

  let targetDir: string | undefined;

  if (link.path) {
    targetDir = path.resolve(projectDir, link.path);
  } else if (config.targetDirForLinking && link.dirName) {
    targetDir = path.resolve(config.targetDirForLinking, link.dirName);
  } else if (config.targetDirForLinking) {
    targetDir = path.resolve(config.targetDirForLinking, link.packageName);
  }

  if (!targetDir) {
    throw log(
      `Не удалось разрешить целевую директорию для "${link.packageName}"`,
      { type: 'error' },
    );
  }

  log(`Целевая директория: ${targetDir}`, { type: 'info', nextLevel: 3 });

  /**
   * @example /home/username/my-kek-apps/packages/fruits/node_modules/@js2me/uikit
   */
  let usageDependencyPath = '';
  let nodeModulesPath = '';

  // Scenario for single project (./node_modules/@js2me/dep)
  const dependencyInnerPath = path.resolve(
    projectDir,
    `./node_modules/${link.packageName}`,
  );
  // Scenario for monorepo (../../node_modules/@js2me/dep)
  const dependencyOuterPath = path.resolve(
    projectDir,
    `../../node_modules/${link.packageName}`,
  );

  if (existsSync(dependencyInnerPath)) {
    usageDependencyPath = dependencyInnerPath;
    nodeModulesPath = path.resolve(projectDir, './node_modules');
  } else if (existsSync(dependencyOuterPath)) {
    usageDependencyPath = dependencyOuterPath;
    nodeModulesPath = path.resolve(projectDir, '../../node_modules');
  }

  if (!usageDependencyPath) {
    throw log(
      `Не удалось разрешить проектную зависимость ${link.packageName}\r\n` +
        `Попытки найти по этим путям: ${dependencyInnerPath}, ${dependencyOuterPath})`,
      {
        type: 'error',
      },
    );
  }

  const packageJson = getPackageJson({
    packageDescription: link.packageName,
    pathWhereContainsPackageJson: usageDependencyPath,
  });

  const scanDirForDep = (path: string, depName: string) => {
    let itemsInDepDir: string[] = [];

    try {
      itemsInDepDir = (readdirSync(path) || []).filter(
        (it) => it !== 'node_modules',
      );
      // eslint-disable-next-line no-empty
    } catch {
      log(
        'Неудачное сканирование директории где содержится зависимость - ' +
          depName +
          ` (путь сканирования: ${path})`,
        { type: 'warn' },
      );
    }

    return itemsInDepDir;
  };
  const itemsInDepDir = scanDirForDep(usageDependencyPath, link.packageName);

  if (packageJson.files?.length) {
    packageJson.files.forEach((file: string) => {
      if (file === '*') {
        if (itemsInDepDir.length > 0) {
          itemsInDepDir.forEach((item: string) => {
            createSymlink({
              name: `${link.packageName}(${item})`,
              current: path.resolve(usageDependencyPath, item),
              target: path.resolve(targetDir, `./${item}`),
            });
          });
        }
      } else {
        createSymlink({
          name: `${link.packageName}(${file})`,
          current: path.resolve(usageDependencyPath, file),
          target: path.resolve(targetDir, `./${file}`),
        });
      }
    });
  } else if (itemsInDepDir.length > 0) {
    itemsInDepDir.forEach((item: string) => {
      createSymlink({
        name: `${link.packageName}(${item})`,
        current: path.resolve(usageDependencyPath, item),
        target: path.resolve(targetDir, `./${item}`),
      });
    });
  }

  if (link.additionalDepsToLink?.length) {
    link.additionalDepsToLink.forEach((packageName) => {
      log(`${packageName} линковка`, { level: 3, nextLevel: 4 });
      const packageToLinkDir = path.resolve(
        targetDir,
        `./node_modules/${packageName}`,
      );

      if (!existsSync(packageToLinkDir)) {
        log(
          `Не удалось найти зависимость "${packageName}" установленную для "${link.packageName}" пакета`,
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
                  current: path.resolve(
                    nodeModulesPath,
                    `./${packageName}/${item}`,
                  ),
                  target: path.resolve(packageToLinkDir, `./${item}`),
                });
              });
            }
          } else {
            createSymlink({
              name: `${packageName}(${file})`,
              current: path.resolve(
                nodeModulesPath,
                `./${packageName}/${file}`,
              ),
              target: path.resolve(packageToLinkDir, `./${file}`),
            });
          }
        });
      } else if (itemsInDepDir.length > 0) {
        itemsInDepDir.forEach((item: string) => {
          createSymlink({
            name: `${packageName}(${item})`,
            current: path.resolve(nodeModulesPath, `./${packageName}/${item}`),
            target: path.resolve(packageToLinkDir, `./${item}`),
          });
        });
      }

      log(`${packageName} линковка завершена`, {
        type: 'success',
        nextLevel: 3,
      });
    });
  }

  log(`${link.packageName} линковка завершена`, {
    type: 'success',
    nextLevel: 2,
  });
};
