export interface PackalinkLink {
  packageName: string;
  path?: string;
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
  targetDirForLinking: string;
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
