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
