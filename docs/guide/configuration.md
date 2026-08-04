# Конфигурация

Вся настройка packalink — через файл `packalink.config.js` (или `.mjs` / `.json`) в корне проекта. Используйте `defineConfig()` для автодополнения типов в IDE:

```js
import { defineConfig } from "packalink";

export default defineConfig({
  targetDirForLinking: '../../../open-source',
  links: [
    'mobx-view-model',
    {
      packageName: 'mobx-tanstack-query',
      additionalDepsToLink: ['@tanstack/query-core'],
    },
  ],
})
```

## Поиск конфигурации

packalink ищет конфигурацию в текущей рабочей директории в следующем порядке:

1. `packalink.config.js`
2. `packalink.config.mjs`
3. `packalink.config.json`

Если ни один файл не найден — выбрасывает ошибку.

## Полный список опций

### PackalinkConfig

| Опция | Тип | По умолчанию | Описание |
|---|---|---|---|
| `sourceDirForLinking` | `string?` | `process.cwd()` | Директория проекта, откуда запускается линковка |
| `targetDirForLinking` | `string?` | — | Базовая директория, где находятся репозитории библиотек |
| `links` | `(string \| PackalinkLink)[]` | — **обязательный** | Список пакетов для линковки |
| `createDepsInProjectIfNotExist` | `boolean?` | `false` | Если пакет не найден в `node_modules` проекта — скопировать файлы из исходной директории |

### PackalinkLink

| Опция | Тип | По умолчанию | Описание |
|---|---|---|---|
| `packageName` | `string` | — **обязательный** | Имя npm-пакета для линковки |
| `path` | `string?` | — | Прямой относительный путь от проекта к папке библиотеки (имеет высший приоритет, игнорирует `targetDirForLinking`) |
| `dirName` | `string?` | — | Имя поддиректории в `targetDirForLinking` или абсолютный путь (если `targetDirForLinking` не задан) |
| `depsPath` | `string?` | `./node_modules` | Путь к `node_modules` зависимостей линка (относительно resolved `targetDirForLinking`) |
| `additionalDepsToLink` | `string[]?` | — | Обычные зависимости для линковки в `node_modules` проекта (не peer!) |
| `dedupePeers` | `boolean \| string[]?` | `true` | Дедупликация peer-зависимостей |

## Приоритет разрешения путей

packalink определяет исходную директорию линкуемого пакета в следующем порядке:

1. `link.path` → относительно `sourceDirForLinking` (проекта)
2. `targetDirForLinking` + `link.dirName` → базовая директория + поддиректория
3. `targetDirForLinking` + `link.packageName` → базовая директория + имя пакета
4. `link.dirName` → как абсолютный путь

Если ни один вариант не разрешился — выбрасывается ошибка.

## `createDepsInProjectIfNotExist`

Когда пакет не найден ни в `node_modules` проекта, ни в `../../node_modules` (монорепо):

- `false` (по умолчанию) — выбрасывает ошибку
- `true` — создаёт директорию в `node_modules` проекта и **копирует** все файлы из исходной директории (`cp -r`), затем завершает линковку этого пакета без создания симлинков

Это полезно, когда пакет не указан в зависимостях проекта напрямую, но используется через другие пакеты.

## Примеры конфигурации

### Минимальная

```js
import { defineConfig } from "packalink";

export default defineConfig({
  links: ['my-library'],
})
```

### С кастомными путями

```js
import { defineConfig } from "packalink";

export default defineConfig({
  targetDirForLinking: '../../../open-source',
  links: [
    {
      packageName: 'mobx-view-model',
      dirName: 'mobx-vm-entities/dist',
    },
  ],
})
```

### Полная

```js
import { defineConfig } from "packalink";

export default defineConfig({
  targetDirForLinking: '../../../open-source',
  createDepsInProjectIfNotExist: true,
  links: [
    {
      packageName: 'mobx-view-model',
      dirName: 'mobx-vm-entities/dist',
    },
    {
      packageName: 'mobx-tanstack-query',
      dirName: 'mobx-tanstack-query/dist',
      additionalDepsToLink: ['@tanstack/query-core'],
    },
    {
      packageName: 'mobx-react-routing',
      dirName: 'mobx-react-routing/dist',
      depsPath: '../node_modules',
    },
  ],
})
```

## Подробнее

- [Линки](/guide/links) — детальная настройка каждого линка
- [Dedupe Peers](/guide/dedupe-peers) — дедупликация peer-зависимостей
- [Additional Deps](/guide/additional-deps) — линковка дополнительных зависимостей
