import { execSync } from 'node:child_process';

import { log } from './log.js';

export const $ = (
  command: string,
  {
    safe,
    onSucceed,
    onFailed,
  }: {
    safe?: boolean;
    onSucceed?: (result: string | undefined | null) => void;
    onFailed?: (result: unknown) => void;
  } = {},
) => {
  log(`$: ${command}`, { type: 'debug' });

  const operation = () => {
    const result = execSync(command, { stdio: 'inherit' })?.toString();
    onSucceed?.(result);
    return result;
  };

  if (!safe) {
    return operation();
  }

  try {
    return operation();
  } catch (error) {
    log('Не удалось выполнить команду', { data: error, type: 'error' });
    onFailed?.(error);
    return null;
  }
};
