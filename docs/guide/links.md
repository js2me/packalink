# Линки

`links` — обязательный массив пакетов для линковки. Каждый элемент может быть строкой (имя пакета) или объектом `PackalinkLink`.

## Строковый формат

Указать только имя пакета — packalink будет искать его по стандартным правилам:

```js
links: ['mobx-view-model']
```

Эквивалентно:

```js
links: [{ packageName: 'mobx-view-model' }]
```

## Объектный формат (PackalinkLink)

### packageName

Имя npm-пакета. packalink ищет его в `node_modules` проекта.

```js
{ packageName: 'mobx-view-model' }
```

### path

Прямой относительный путь от директории проекта к папке библиотеки. **Имеет высший приоритет** — игнорирует `targetDirForLinking` и `dirName`:

```js
{ packageName: 'my-lib', path: '../../custom-libs/my-lib/dist' }
// → <projectDir>/../../custom-libs/my-lib/dist
```

### dirName

Работает **в связке с `targetDirForLinking`** — имя поддиректории в базовой директории:

```js
{
  targetDirForLinking: '../../../open-source',
  links: [
    { packageName: 'mobx-view-model', dirName: 'mobx-vm-entities/dist' }
    // → ../../../open-source/mobx-vm-entities/dist
  ]
}
```

Если `dirName` не указан, используется `packageName` как имя папки:

```js
{
  targetDirForLinking: '../../../open-source',
  links: [
    { packageName: 'mobx-react-routing' }
    // → ../../../open-source/mobx-react-routing
  ]
}
```

Если `targetDirForLinking` не задан, `dirName` разрешается как **абсолютный путь**:

```js
links: [
  { packageName: 'my-lib', dirName: '/absolute/path/to/lib/dist' }
]
```

### depsPath

Путь к `node_modules` зависимостей линка. Разрешается **относительно исходной директории линкуемого пакета** (resolved `targetDirForLinking`). По умолчанию `./node_modules`.

Нужен, когда `node_modules` находится не рядом с `dist`. Например:

```js
{
  packageName: 'mobx-react-routing',
  dirName: 'mobx-react-routing/dist',
  depsPath: '../node_modules',
  // → зависимости из mobx-react-routing/node_modules/
  //   а НЕ из mobx-react-routing/dist/node_modules/
}
```

## Приоритет разрешения путей

packalink определяет где находится исходный код линкуемого пакета в следующем порядке:

1. **`link.path`** → `<projectDir>/<link.path>` — прямой путь от проекта
2. **`targetDirForLinking` + `link.dirName`** → базовая директория + поддиректория
3. **`targetDirForLinking` + `link.packageName`** → базовая директория + имя пакета
4. **`link.dirName`** → абсолютный путь

Если ни один вариант не разрешился — ошибка.

## Как packalink ищет пакет в node_modules

Packalink ищет линкуемый пакет в `node_modules` в двух местах:

1. **Внутренний путь**: `<project>/node_modules/<packageName>` — обычный проект
2. **Внешний путь**: `<project>/../../node_modules/<packageName>` — монорепо с pnpm

Если пакет не найден:
- `createDepsInProjectIfNotExist: true` — packalink создаёт директорию и **копирует** файлы из исходной директории (`cp -r`), линковка завершается без симлинков
- `createDepsInProjectIfNotExist: false` (по умолчанию) — выбрасывает ошибку

## Линковка файлов

Packalink читает `package.json.files` линкуемого пакета и создаёт **отдельный симлинк для каждого файла/директории** из списка:

```js
// package.json линкуемого пакета:
{ "files": ["dist", "README.md", "LICENSE"] }

// Packalink создаст:
// node_modules/my-lib/dist        → <target>/dist
// node_modules/my-lib/README.md   → <target>/README.md
// node_modules/my-lib/LICENSE     → <target>/LICENSE
```

Если `files` не указан или содержит `"*"` — линкуется всё содержимое директории (кроме `node_modules`).

::: tip Зачем файловые симлинки?
Файловые симлинки (не каталог-симлинк) сохраняют границу `node_modules/<pkg>/node_modules/` — именно туда `dedupePeers` кладёт симлинки peer-зависимостей. Каталог-симлинк не позволяет создать эту поддиректорию.
:::

## Подробнее

- [Dedupe Peers](/guide/dedupe-peers) — дедупликация peer-зависимостей
- [Additional Deps](/guide/additional-deps) — линковка дополнительных зависимостей
