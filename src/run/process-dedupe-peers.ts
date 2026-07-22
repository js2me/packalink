import { existsSync } from 'node:fs';
import path from 'node:path';

import { createSymlink } from '../utils/create-sym-link.js';
import { getPackageJson } from '../utils/get-package-json.js';
import { log } from '../utils/log.js';

import type { ProceedPackalinkLink } from './process-link.js';

const DANGEROUS_ADDITIONAL_DEPS = new Set([
  'react',
  'react-dom',
  'react-native',
  'preact',
  'mobx',
  'mobx-react-lite',
  'mobx-react',
]);

const resolvePeerNames = (proceedLink: ProceedPackalinkLink): string[] => {
  const option = proceedLink.dedupePeers;

  if (option === false) {
    return [];
  }

  if (Array.isArray(option)) {
    return option;
  }

  // default: true — take peerDependencies from the linked package
  try {
    const packageJson = getPackageJson({
      packageDescription: proceedLink.packageName,
      pathWhereContainsPackageJson: proceedLink.targetDirForLinking,
      ignoreFilesCheck: true,
    });
    return Object.keys(packageJson.peerDependencies ?? {});
  } catch {
    return [];
  }
};

/**
 * File-level symlinks into node_modules/<pkg> point at the library dist
 * (realpath). Node then resolves `react` from the library tree → duplicate
 * React / Invalid hook call.
 *
 * Fix: put consumer peers next to dist (`dist/node_modules/react` →
 * `<project>/node_modules/react`) so resolution from the realpath hits the
 * same copy the app uses.
 */
export const processDedupePeers = (proceedLink: ProceedPackalinkLink) => {
  if (proceedLink.additionalDepsToLink?.length) {
    const dangerous = proceedLink.additionalDepsToLink.filter((name) =>
      DANGEROUS_ADDITIONAL_DEPS.has(name),
    );
    if (dangerous.length > 0) {
      log(
        `${proceedLink.packageName}: additionalDepsToLink [${dangerous.join(', ')}] ` +
          `затрёт peer в проекте и почти наверняка даст duplicate React. ` +
          `Используй dedupePeers (включён по умолчанию) — он линкует peer проекта В dist пакета.`,
        { type: 'warn', level: 3 },
      );
    }
  }

  const peerNames = resolvePeerNames(proceedLink);
  if (peerNames.length === 0) {
    return;
  }

  log(`${proceedLink.packageName}: dedupePeers → ${peerNames.join(', ')}`, {
    type: 'info',
    level: 3,
    nextLevel: 4,
  });

  for (const packageName of peerNames) {
    const sourcePath = path.resolve(
      proceedLink.nodeModulesPath,
      `./${packageName}`,
    );
    const targetPath = path.resolve(
      proceedLink.targetDirForLinking,
      `./node_modules/${packageName}`,
    );

    if (!existsSync(sourcePath)) {
      log(
        `peer "${packageName}" нет в ${proceedLink.nodeModulesPath} — пропуск`,
        { type: 'warn' },
      );
      continue;
    }

    createSymlink({
      name: `dedupePeers ${packageName} ← project (for ${proceedLink.packageName})`,
      targetPath,
      sourcePath,
      createIfMissing: true,
    });
  }

  log(`${proceedLink.packageName}: dedupePeers завершён`, {
    type: 'success',
    nextLevel: 3,
  });
};
