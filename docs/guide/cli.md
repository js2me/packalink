# CLI

Packalink запускается из командной строки:

```bash
npx --yes packalink
```

## Как это работает

1. Определяет текущую рабочую директорию (`process.cwd()`)
2. Ищет конфигурацию в следующем порядке:
   - `packalink.config.js`
   - `packalink.config.mjs`
   - `packalink.config.json`
3. Загружает и валидирует конфигурацию (проверяет наличие `links` в default-экспорте)
4. Запускает процесс линковки

## Ошибки конфигурации

Если ни один файл не найден:

```
Error: packalink.config.(js|mjs|json) not found
```

Если конфигурация не содержит `links`:

```
Error: packalink.config.(js|mjs|json) is not valid
```

## Процесс линковки

При запуске packalink выполняет следующие шаги:

1. **Определяет директории** — `projectDir` (из `sourceDirForLinking` или `process.cwd()`), `targetDirForLinking`
2. **Валидирует** — проверяет что `targetDirForLinking` существует; если `links` пустой — выводит предупреждение и завершает
3. **Очищает кэш Vite** — удаляет `node_modules/.vite` в проекте, если существует
4. **Линкует каждый пакет** — вызывает `processLink()` для каждого линка: создаёт файловые симлинки из `dist` в `node_modules`
5. **Обрабатывает additional deps** — для каждого линка вызывает `processAdditionalDeps()`: линкует обычные зависимости в `node_modules` проекта
6. **Дедуплицирует peer-зависимости** — для каждого линка вызывает `processDedupePeers()`: симлинкает peer-зависимости проекта рядом с `dist`
7. **Дедуплицирует кросс-линкованные зависимости** — если несколько пакетов линкуются одновременно и зависят друг от друга, симлинкает их из `node_modules` проекта в `<linkedDist>/node_modules/<dep>`

## Логирование

Packalink выводит подробный лог процесса:

```
[packalink]
  версия: 0.0.18
  директория: /path/to/packalink

Рабочая директория: /path/to/project

mobx-view-model линковка
  Целевая директория: /path/to/mobx-vm-entities/dist
  Директория с зависимостями: /path/to/mobx-vm-entities/dist/node_modules
mobx-view-model линковка завершена

mobx-view-model: dedupePeers → react, react-dom
  dedupePeers react ← project (for mobx-view-model)
  dedupePeers react-dom ← project (for mobx-view-model)
mobx-view-model: dedupePeers завершён

mobx-view-model-react: dedupeLinkedDeps → mobx-view-model
  dedupeLinkedDeps mobx-view-model ← project (for mobx-view-model-react)
mobx-view-model-react: dedupeLinkedDeps завершён
```

## Скрипт в package.json

Можно добавить скрипт для удобства:

```json
{
  "scripts": {
    "link": "packalink"
  }
}
```

И запускать:

```bash
pnpm link
```
