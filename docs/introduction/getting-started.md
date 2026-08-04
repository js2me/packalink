# Начало работы

**packalink** — инструмент для локальной разработки Node.js пакетов. Создаёт **файловые симлинки** из `dist` библиотеки в `node_modules` проекта — изменения в сборке мгновенно доступны без переустановки.

Главная проблема, которую решает packalink — **«duplicate React / Invalid hook call»**, возникающая при `npm link`. Node.js резолвит импорты по realpath, уходя в `node_modules` репозитория библиотеки, что даёт второй экземпляр React.

## Предварительные требования

- **Node.js** >= 20
- **pnpm** (рекомендуется) или npm/yarn

## Установка

packalink не нужно устанавливать глобально — запускается через `npx`:

```bash
npx --yes packalink
```

Или как зависимость для разработки:

```bash
pnpm add -D packalink
```

## Создание конфигурации

Создайте файл `packalink.config.js` (или `.mjs` / `.json`) в корне проекта:

```js
import { defineConfig } from "packalink";

export default defineConfig({
  targetDirForLinking: '../../../open-source',
  links: [
    'mobx-view-model',
    {
      packageName: 'mobx-tanstack-query',
      dirName: 'mobx-tanstack-query/dist',
      additionalDepsToLink: ['@tanstack/query-core'],
    },
  ],
})
```

## Запуск

```bash
npx --yes packalink
```

## Что происходит при запуске

1. **Очищает кэш Vite** — удаляет `node_modules/.vite`, чтобы Vite не использовал устаревшие модули
2. **Линкует каждый пакет** — создаёт файловые симлинки из `dist` каждого линка в `node_modules` проекта
3. **Линкует дополнительные зависимости** — для каждого `additionalDepsToLink` (обычные зависимости, не peer)
4. **Дедуплицирует peer-зависимости** — симлинкает React/mobx проекта рядом с `dist` линкуемого пакета
5. **Дедуплицирует кросс-линкованные зависимости** — если несколько пакетов линкуются одновременно и зависят друг от друга, packalink гарантирует единый экземпляр каждого

## Что дальше?

- [Проблема duplicate React](/introduction/problem) — почему `npm link` ломает React
- [Конфигурация](/guide/configuration) — полный список опций
- [Dedupe Peers](/guide/dedupe-peers) — как работает дедупликация peer-зависимостей и кросс-линкованных зависимостей
