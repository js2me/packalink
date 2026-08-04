# Additional Deps (additionalDepsToLink)

## Что это

`additionalDepsToLink` — список **обычных зависимостей** (dependencies, не peerDependencies), которые нужно симлинкнуть в `node_modules` проекта из зависимостей линкуемого пакета.

Используется, когда:
- Линкуемый пакет зависит от пакета, который **не установлен в проекте**
- Этот пакет — **не peer-зависимость** (для peer используйте `dedupePeers`)

## Пример

`mobx-tanstack-query` зависит от `@tanstack/query-core`, но этот пакет не установлен в проекте. Без линковки `@tanstack/query-core` резолвится из `node_modules` репозитория библиотеки — а это может быть другая версия.

```js
{
  packageName: 'mobx-tanstack-query',
  dirName: 'mobx-tanstack-query/dist',
  additionalDepsToLink: ['@tanstack/query-core'],
}
```

Packalink создаст файловые симлинки:

```
project/node_modules/@tanstack/query-core/dist → <linkedLib>/node_modules/@tanstack/query-core/dist
```

## Как работает

1. Packalink ищет `additionalDepsToLink` пакет в `node_modules` линкуемого пакета (`linkDepsNodeModulesPath`)
2. Читает `package.json.files` и создаёт файловые симлинки для каждого файла/директории
3. Если `files` не указан или содержит `"*"` — линкует всё содержимое (кроме `node_modules`)

## Переисользование линков

Если пакет из `additionalDepsToLink` уже есть в основном списке `links`, packalink использует его **уже обработанную исходную директорию** вместо `node_modules` линкуемого пакета. Это гарантирует, что additional dep указывает на локальный исходный код, а не на stale-копию:

```js
{
  links: [
    {
      packageName: '@tanstack/query-core',
      // ... уже линкуется отдельно
    },
    {
      packageName: 'mobx-tanstack-query',
      additionalDepsToLink: ['@tanstack/query-core'],
      // packalink обнаружит, что @tanstack/query-core уже обработан
      // и использует его директорию
    },
  ]
}
```

При переиспользовании целевая директория — `node_modules` линкуемого пакета (`linkDepsNodeModulesPath`), а не `node_modules` проекта. Это позволяет additional dep резолвиться из контекста линкуемого пакета.

## Предупреждение об опасных пакетах

::: warning Не используйте для peer-зависимостей
Не кладите `react`, `react-dom`, `mobx` и другие peer-пакеты в `additionalDepsToLink`. Это затирает копию проекта и почти наверняка даёт **duplicate React / Invalid hook call**.

Для peer-зависимостей используйте `dedupePeers` (включён по умолчанию).
:::

Packalink выводит предупреждение, если обнаружит один из этих пакетов в `additionalDepsToLink`: `react`, `react-dom`, `react-native`, `preact`, `mobx`, `mobx-react-lite`, `mobx-react`.

## Подробнее

- [Dedupe Peers](/guide/dedupe-peers) — для peer-зависимостей
- [Линки](/guide/links) — настройка линков
