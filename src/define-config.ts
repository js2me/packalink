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
   *       additionalDepsToLink: ['react', 'react-dom'],
   * Тогда дополнительные зависимости буду линковаться из mobx-vm-entities/node_modules/react и mobx-vm-entities/node_modules/react-dom
   * а без этого параметры линковались бы из
   * mobx-vm-entities/dist/node_modules/react и mobx-vm-entities/dist/node_modules/react-dom
   */
  depsPath?: string;
  /**
   * Список дочерних пакетов для линковки
   */
  additionalDepsToLink?: string[];
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
}

export const defineConfig = (config: PackalinkConfig) => {
  return config;
};
