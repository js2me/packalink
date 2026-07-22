export interface PackalinkLink {
  packageName: string;
  /**
   * Релативный путь к папке с зависимостью (игнорирует targetDirForLinking)
   */
  path?: string;
  /**
   * В случае если папка называется по другому в отличие от packageName (работает в связки с targetDirForLinking)
   */
  dirName?: string;
  /**
   * Путь к папке с зависимостями
   * Нужен в случае если зависимости линки находятся не в подуровне например:
   * Мы указали
   *       packageName: 'mobx-view-model',
   *       dirName: 'mobx-vm-entities/dist',
   *       depsPath: '../node_modules',
   *       additionalDepsToLink: ['@tanstack/query-core'],
   * Тогда дополнительные зависимости буду линковаться из mobx-vm-entities/node_modules/...
   * а без этого параметры линковались бы из
   * mobx-vm-entities/dist/node_modules/...
   */
  depsPath?: string;
  /**
   * Список дочерних пакетов для линковки **в node_modules проекта**
   * (из deps пакета → project/node_modules).
   *
   * Не используй для peer'ов вроде react/react-dom — это затирает копию
   * проекта и даёт duplicate React. Для peer'ов см. {@link dedupePeers}.
   */
  additionalDepsToLink?: string[];
  /**
   * Dedupe peer dependencies: symlink **project** peers into
   * `<linkedDist>/node_modules/<peer>` so Node realpath resolution from the
   * linked dist hits the same React/mobx as the app.
   *
   * - `true` (default): all `peerDependencies` from the linked package.json
   * - `string[]`: only these names
   * - `false`: disable
   */
  dedupePeers?: boolean | string[];
}

export interface PackalinkConfig {
  /**
   * Исходная директория для линковки
   * Например:
   *  - ../../my-projects
   */
  sourceDirForLinking?: string;
  /**
   * Директория для линковки
   * Например:
   *  - .
   */
  targetDirForLinking?: string;
  /**
   * Список пакетов для линковки
   * Например:
   *  - ['@js2me/uikit', '@js2me/utils']
   */
  links: (string | PackalinkLink)[];

  /**
   * Создать зависимости в проекте если они не существуют
   *
   * Это может быть полезно, когда у нас есть зависимость
   * Например: ui-prikol
   * Которая явно не указана в зависимостях проекта, НО
   * Эта зависиомсть встречается в зависимостях других пакетов
   * Например в той зависимости, которая ЕСТЬ В DEPENDENCIES
   */
  createDepsInProjectIfNotExist?: boolean;
}

export const defineConfig = (config: PackalinkConfig) => {
  return config;
};
