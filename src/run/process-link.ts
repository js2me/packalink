import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { PackalinkConfig, PackalinkLink } from '../define-config.js';
import { createSymlink } from '../utils/create-sym-link.js';
import { getPackageJson } from '../utils/get-package-json.js';
import { log } from '../utils/log.js';

export interface ProceedPackalinkLink extends PackalinkLink {
  targetDirForLinking: string;
  linkDepsNodeModulesPath: string;
  usageDependencyPath: string;
  nodeModulesPath: string;
}

export const scanDirForDep = (path: string, depName: string) => {
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

export const processLink = (
  projectDir: string,
  config: PackalinkConfig,
  link: PackalinkLink,
): ProceedPackalinkLink => {
  log(`${link.packageName} линковка`, { type: 'info', nextLevel: 3 });

  const proceedLink: ProceedPackalinkLink = {
    ...link,
    targetDirForLinking: '',
    linkDepsNodeModulesPath: '',
    usageDependencyPath: '',
    nodeModulesPath: '',
  };

  if (link.path) {
    proceedLink.targetDirForLinking = path.resolve(projectDir, link.path);
  } else if (config.targetDirForLinking && link.dirName) {
    proceedLink.targetDirForLinking = path.resolve(
      config.targetDirForLinking,
      link.dirName,
    );
  } else if (config.targetDirForLinking) {
    proceedLink.targetDirForLinking = path.resolve(
      config.targetDirForLinking,
      link.packageName,
    );
  } else if (link.dirName) {
    proceedLink.targetDirForLinking = path.resolve(link.dirName);
  }

  if (!proceedLink.targetDirForLinking) {
    throw log(
      `Не удалось разрешить целевую директорию для "${link.packageName}"`,
      { type: 'error' },
    );
  }

  proceedLink.linkDepsNodeModulesPath = link.depsPath
    ? path.resolve(proceedLink.targetDirForLinking, link.depsPath)
    : path.resolve(proceedLink.targetDirForLinking, './node_modules');

  log(`Целевая директория: ${proceedLink.targetDirForLinking}`, {
    type: 'info',
    nextLevel: 3,
  });
  log(`Директория с зависимостями: ${proceedLink.linkDepsNodeModulesPath}`, {
    type: 'info',
    nextLevel: 3,
  });

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
    proceedLink.usageDependencyPath = dependencyInnerPath;
    proceedLink.nodeModulesPath = path.resolve(projectDir, './node_modules');
  } else if (existsSync(dependencyOuterPath)) {
    proceedLink.usageDependencyPath = dependencyOuterPath;
    proceedLink.nodeModulesPath = path.resolve(
      projectDir,
      '../../node_modules',
    );
  }

  if (!proceedLink.usageDependencyPath) {
    if (config.createDepsInProjectIfNotExist) {
      log(
        `Проектная зависимость ${link.packageName} не обнаружена, создаем ее`,
        { type: 'warn' },
      );
      log('Причина создания флаг [createDepsInProjectIfNotExist]', {
        type: 'debug',
      });
      log(`Путь куда положим: ${dependencyInnerPath}`, {
        type: 'debug',
      });
      proceedLink.usageDependencyPath = dependencyInnerPath;
      proceedLink.nodeModulesPath = path.resolve(projectDir, './node_modules');
      createSymlink({
        name: `${link.packageName}(искусственная зависимость)`,
        sourcePath: proceedLink.targetDirForLinking,
        targetPath: proceedLink.usageDependencyPath,
        raw: true,
      });
    } else {
      throw log(
        `Не удалось разрешить проектную зависимость ${link.packageName}\r\n` +
          `Попытки найти по этим путям: ${dependencyInnerPath}, ${dependencyOuterPath})`,
        {
          type: 'error',
        },
      );
    }
  }

  const packageJson = getPackageJson({
    packageDescription: link.packageName,
    pathWhereContainsPackageJson: proceedLink.usageDependencyPath,
  });

  const itemsInDepDir = scanDirForDep(
    proceedLink.usageDependencyPath,
    link.packageName,
  );

  if (packageJson.files?.length) {
    packageJson.files.forEach((file: string) => {
      if (file === '*') {
        if (itemsInDepDir.length > 0) {
          itemsInDepDir.forEach((item: string) => {
            createSymlink({
              name: `${link.packageName}(${item})`,
              targetPath: path.resolve(proceedLink.usageDependencyPath, item),
              sourcePath: path.resolve(
                proceedLink.targetDirForLinking,
                `./${item}`,
              ),
            });
          });
        }
      } else {
        createSymlink({
          name: `${link.packageName}(${file})`,
          targetPath: path.resolve(proceedLink.usageDependencyPath, file),
          sourcePath: path.resolve(
            proceedLink.targetDirForLinking,
            `./${file}`,
          ),
        });
      }
    });
  } else if (itemsInDepDir.length > 0) {
    itemsInDepDir.forEach((item: string) => {
      createSymlink({
        name: `${link.packageName}(${item})`,
        targetPath: path.resolve(proceedLink.usageDependencyPath, item),
        sourcePath: path.resolve(proceedLink.targetDirForLinking, `./${item}`),
      });
    });
  }

  log(`${link.packageName} линковка завершена`, {
    type: 'success',
    nextLevel: 2,
  });

  return proceedLink;
};
