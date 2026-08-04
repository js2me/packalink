# Dedupe Peers

## Проблема

Когда packalink линкует **файлы** из `dist`, Node.js при импорте резолвит по realpath — реальному пути к исходному коду библиотеки. Это значит, что `react` (и другие peer-зависимости) резолвятся из `node_modules` **репозитория библиотеки**, а не проекта.

Результат — duplicate React и **Invalid hook call**.

## Решение

`dedupePeers` создаёт симлинки peer-зависимостей **проекта** внутри `node_modules` рядом с `dist` линкуемого пакета:

```
<linkedDist>/node_modules/react → <project>/node_modules/react
```

Когда Node резолвит `react` из linked-кода по realpath, он находит `react` в `<linkedDist>/node_modules/` первым — тот же экземпляр, что использует приложение.

## Опции

### `dedupePeers: true` (по умолчанию)

Автоматически берёт все `peerDependencies` из `package.json` линкуемого пакета:

```js
{
  packageName: 'mobx-view-model',
  // dedupePeers: true — не нужно указывать, это default
  // peer react/react-dom дедупятся автоматически
}
```

### `dedupePeers: ['react', 'react-dom']`

Указать конкретные peer-пакеты вручную:

```js
{
  packageName: 'my-lib',
  dedupePeers: ['react', 'react-dom'],
}
```

### `dedupePeers: false`

Отключить дедупликацию peer-зависимостей:

```js
{
  packageName: 'my-lib',
  dedupePeers: false,
}
```

## Как работает dedupe peers

1. Определяет список peer-пакетов через `resolvePeerNames()` (см. опции выше)
2. Для каждого peer-пакета проверяет его наличие в `node_modules` проекта
3. Если peer найден — создаёт симлинк:
   - **source**: `<project>/node_modules/<peer>`
   - **target**: `<linkedDist>/node_modules/<peer>`
   - Каталог `node_modules` создаётся автоматически, если не существует
4. Если peer не найден — выводит предупреждение и пропускает

## Кросс-линкованные зависимости

Когда несколько пакетов линкуются одновременно и один зависит от другого (например, `mobx-view-model-react` зависит от `mobx-view-model`), Vite может резолвить зависимость через симлинки монорепо вместо `node_modules` проекта.

Это даёт **два экземпляра модуля** с отдельным внутренним состоянием:
- Два `$mobx` символа в MobX
- Два `viewModelsConfig` — конфигурация не шарится
- Синглтоны не работают

packalink автоматически определяет кросс-зависимости между линкуемыми пакетами и симлинкает их из `node_modules` проекта в `<linkedDist>/node_modules/<dep>` — тот же паттерн, что и для peer-зависимостей.

Это работает автоматически — дополнительная настройка не нужна. packalink:
1. Читает `dependencies` и `peerDependencies` из `package.json` каждого линкуемого пакета
2. Проверяет, какие из них есть в основном списке `links`
3. Симлинкает каждую кросс-зависимость из `node_modules` проекта в `<linkedDist>/node_modules/<dep>`

## Предупреждение об опасных пакетах

Packalink предупреждает, если вы добавляете **опасные peer-пакеты** в `additionalDepsToLink` вместо `dedupePeers`. Эти пакеты затирают копию проекта и почти наверняка дают duplicate React:

- `react`
- `react-dom`
- `react-native`
- `preact`
- `mobx`
- `mobx-react-lite`
- `mobx-react`

::: warning Важно
Не кладите `react` / `react-dom` / `mobx` в `additionalDepsToLink` — это затирает peer в проекте и даёт duplicate React. Используйте `dedupePeers` (включён по умолчанию).
:::

## Подробнее

- [Проблема duplicate React](/introduction/problem) — почему это происходит
- [Additional Deps](/guide/additional-deps) — линковка обычных зависимостей
