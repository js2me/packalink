# API: run

`run` — основная функция, которая выполняет процесс линковки. Вызывается из CLI или программно.

## Использование

```ts
import { run } from 'packalink'

run({
  targetDirForLinking: '../../../open-source',
  links: ['mobx-view-model'],
})
```

## Параметры

Принимает объект типа `PackalinkConfig` (обязательный). Смотрите [defineConfig](/api/define-config) для полного списка опций.

## Что делает run

1. **Определяет директории** — `projectDir` (из `sourceDirForLinking` или `process.cwd()`), `targetDirForLinking`
2. **Логирует версию** — выводит версию packalink и пути
3. **Валидирует** — проверяет что `targetDirForLinking` существует на диске; если `links` пустой — выводит предупреждение и завершает
4. **Очищает кэш Vite** — удаляет `node_modules/.vite` в `projectDir`, если существует
5. **Обрабатывает каждый линк** — вызывает `processLink()` для создания файловых симлинков
6. **Обрабатывает additional deps** — вызывает `processAdditionalDeps()` для каждого линка
7. **Обрабатывает dedupe peers** — вызывает `processDedupePeers()` для каждого линка (включая кросс-линкованные зависимости)

## Возвращаемое значение

Функция не возвращает значение (`void`). Ошибки выбрасываются через исключения.

## Ошибки

| Условие | Поведение |
|---|---|
| `targetDirForLinking` не существует | Выбрасывает ошибку |
| `links` пустой | Выводит предупреждение, завершает без ошибки |
| Пакет не найден в `node_modules` | Выбрасывает ошибку (если `createDepsInProjectIfNotExist` не включён) |
| Не удалось разрешить целевую директорию | Выбрасывает ошибку |

## Программное использование

Packalink можно использовать не только через CLI, но и программно:

```ts
import { run, defineConfig } from 'packalink'

const config = defineConfig({
  targetDirForLinking: '../../../open-source',
  links: [
    {
      packageName: 'mobx-view-model',
      dirName: 'mobx-vm-entities/dist',
    },
  ],
})

run(config)
```

Это полезно для интеграции в скрипты сборки или CI.

## Подробнее

- [defineConfig](/api/define-config) — типы конфигурации
- [CLI](/guide/cli) — командная строка
