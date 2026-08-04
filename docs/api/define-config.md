# API: defineConfig

`defineConfig` — вспомогательная функция для типизированной конфигурации packalink. Является type-identity — просто возвращает переданный объект, но обеспечивает полную типизацию и автодополнение в IDE.

## Использование

```js
import { defineConfig } from "packalink";

export default defineConfig({
  targetDirForLinking: '../../../open-source',
  links: ['mobx-view-model'],
})
```

## Типы

### PackalinkConfig

```ts
interface PackalinkConfig {
  /** Директория проекта (по умолчанию: process.cwd()) */
  sourceDirForLinking?: string

  /** Базовая директория, где находятся репозитории библиотек */
  targetDirForLinking?: string

  /** Список пакетов для линковки (обязательный) */
  links: (string | PackalinkLink)[]

  /**
   * Если пакет не найден в node_modules проекта —
   * скопировать файлы из исходной директории
   */
  createDepsInProjectIfNotExist?: boolean
}
```

### PackalinkLink

```ts
interface PackalinkLink {
  /** Имя npm-пакета для линковки (обязательный) */
  packageName: string

  /**
   * Прямой относительный путь от проекта к папке библиотеки
   * Имеет высший приоритет, игнорирует targetDirForLinking
   */
  path?: string

  /**
   * Имя поддиректории в targetDirForLinking
   * Или абсолютный путь, если targetDirForLinking не задан
   */
  dirName?: string

  /**
   * Путь к node_modules зависимостей линка
   * Относительно resolved targetDirForLinking (по умолчанию: './node_modules')
   */
  depsPath?: string

  /**
   * Обычные зависимости для линковки в node_modules проекта
   * Не используйте для peer-зависимостей — см. dedupePeers
   */
  additionalDepsToLink?: string[]

  /**
   * Дедупликация peer-зависимостей:
   * - true (default) — все peerDependencies из package.json
   * - string[] — только указанные пакеты
   * - false — отключить
   */
  dedupePeers?: boolean | string[]
}
```

## Импорт типов

```ts
import type { PackalinkConfig, PackalinkLink } from 'packalink'
```

## Экспорты

Packalink экспортирует из `src/index.ts`:

- `run` — основная функция запуска линковки
- `defineConfig` — помощник типизации конфигурации
- `PackalinkConfig` — тип конфигурации
- `PackalinkLink` — тип линка

## Подробнее

- [run](/api/run) — основная функция API
- [Конфигурация](/guide/configuration) — описание всех опций
