# Проблема duplicate React

## Что происходит при `npm link`

При `npm link` Node.js создаёт симлинк **на каталог целиком**. Когда приложение импортирует linked-пакет, Node резолвит импорт по **realpath** — реальному пути к исходному коду библиотеки.

Когда linked-код импортирует `react`, Node ищет `react` в `node_modules` **репозитория библиотеки**, а не проекта. Результат — два экземпляра React в памяти:

```
project/node_modules/react   ← React #1 (используется приложением)
library/node_modules/react   ← React #2 (используется linked-кодом по realpath)
```

Два React = **Invalid hook call**, потому что хуки React привязаны к конкретному экземпляру.

## Как решает packalink

### Файловые симлинки вместо каталога

packalink создаёт симлинки **на каждый файл** внутри пакета, а не на каталог целиком. Это ключевое архитектурное решение:

```
# npm link — симлинк на каталог:
node_modules/my-lib → /path/to/library    (один симлинк)

# packalink — симлинки на каждый файл:
node_modules/my-lib/dist       → /path/to/library/dist
node_modules/my-lib/package.json → /path/to/library/package.json
node_modules/my-lib/README.md  → /path/to/library/README.md
```

Зачем: каталог-симлинк не позволяет создать `node_modules/my-lib/node_modules/` — а именно туда packalink кладёт dedupe-симлинки. Файловые симлинки сохраняют эту границу.

### Dedupe peers

Node по-прежнему резолвит по realpath и может уйти в репозиторий библиотеки. Чтобы исправить это, packalink создаёт **симлинки peer-зависимостей проекта** внутри `node_modules` рядом с `dist`:

```
<linkedDist>/node_modules/react → <project>/node_modules/react
```

Когда Node резолвит `react` из linked-кода по realpath, он находит `react` в `<linkedDist>/node_modules/` — тот же экземпляр, что использует приложение.

### Dedupe кросс-линкованных зависимостей

Если несколько пакетов линкуются одновременно и один зависит от другого (например, `mobx-view-model-react` зависит от `mobx-view-model`), Vite может резолвить зависимость через симлинки монорепо вместо `node_modules` проекта. Это даёт два экземпляра модуля с отдельным внутренним состоянием.

packalink решает это тем же способом: симлинкает кросс-зависимость из `node_modules` проекта в `<linkedDist>/node_modules/<dep>`.

## Почему `--preserve-symlinks` не подходит

Node.js флаг `--preserve-symlinks` предотвращает realpath-резолв, но ломает вложенные зависимости pnpm (например `history`), потому что pnpm использует симлинки для своей структуры `node_modules`.

## Альтернативы

| Подход | Проблема |
|---|---|
| `npm link` | Duplicate React / Invalid hook call |
| `--preserve-symlinks` | Ломает pnpm nested deps |
| Копирование файлов | Нужно копировать при каждом изменении |
| **packalink** | ✅ Файловые симлинки + dedupe peers + dedupe кросс-зависимостей |

## Подробнее

- [Dedupe Peers](/guide/dedupe-peers) — настройка дедупликации
- [Конфигурация](/guide/configuration) — полный список опций
