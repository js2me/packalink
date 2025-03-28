/* eslint-disable unicorn/no-nested-ternary */
/* eslint-disable sonarjs/no-nested-conditional */
import chalk from 'chalk';

// Определение цветов для различных типов логирования
const logColors = {
  debug: chalk.gray,
  info: chalk.blue,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
} as const;

let lastLevel = 0;
let isInGroup = false;

export const log = (
  message: string,
  {
    level = lastLevel,
    nextLevel,
    nested = false,
    type = 'info',
    isGroupStart = false, // Флаг для начала группы
    isGroupEnd = false, // Флаг для завершения группы
    ...extras
  }: {
    level?: number;
    nextLevel?: number;
    nested?: boolean; // Параметр для обозначения вложенного уровня
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    type?: keyof typeof logColors;
    isGroupStart?: boolean;
    isGroupEnd?: boolean;
  } = {},
) => {
  const extraLogs = 'data' in extras ? [extras.data] : [];
  // Логирование сообщения
  level = nested ? level + 1 : level;
  const indent = '  '.repeat(level);
  const prefix =
    level === 0
      ? isInGroup
        ? '  '
        : ''
      : `${isInGroup ? ' ' : nested ? '└─>' : '└─'} `;

  const color = logColors[type] || logColors.debug; // Используем цвет debug по умолчанию

  if (isGroupStart) {
    isInGroup = true;
    console.log(`${indent}${chalk.cyan(`┌─ ${message}`)}`, ...extraLogs);
    return;
  } else if (isGroupEnd) {
    isInGroup = false;
    console.log(`${indent}${chalk.cyan(`└─ ${message}`)}`, ...extraLogs);
    return;
  } else {
    console.log(`${indent}${color(prefix)}${color(message)}`, ...extraLogs);
  }

  if (nextLevel != null) {
    lastLevel = nextLevel;
  } else if (!nested) {
    lastLevel = level;
  }
};
