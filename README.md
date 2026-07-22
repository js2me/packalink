# packalink

[![NPM version][npm-image]][npm-url] [![test status][github-test-actions-image]][github-actions-url] [![build status][github-build-actions-image]][github-actions-url] [![npm download][download-image]][download-url] [![bundle size][bundlephobia-image]][bundlephobia-url]


[npm-image]: http://img.shields.io/npm/v/packalink.svg
[npm-url]: http://npmjs.org/package/packalink
[github-test-actions-image]: https://github.com/js2me/packalink/workflows/Test/badge.svg
[github-build-actions-image]: https://github.com/js2me/packalink/workflows/Build/badge.svg
[github-actions-url]: https://github.com/js2me/packalink/actions
[download-image]: https://img.shields.io/npm/dm/packalink.svg
[download-url]: https://npmjs.org/package/packalink
[bundlephobia-url]: https://badgen.io/bundlephobia/minzip/packalink
[bundlephobia-image]: https://badgen.net/bundlephobia/minzip/packalink

## Линковщик

`packalink.config.js`

```js
import { defineConfig } from "packalink";

export default defineConfig({
  targetDirForLinking: '../../../open-source',
  links: [
    {
      packageName: 'mobx-view-model',
      dirName: 'mobx-vm-entities/dist',
      // peer react/react-dom дедупятся автоматически (dedupePeers: true):
      // <dist>/node_modules/react → project/node_modules/react
    },
    {
      packageName: 'mobx-tanstack-query',
      dirName: 'mobx-tanstack-query/dist',
      // обычные deps, которых нет в проекте — в project/node_modules
      additionalDepsToLink: ['@tanstack/query-core'],
    },
    {
      packageName: 'mobx-react-routing',
      dirName: 'mobx-react-routing/dist',
      depsPath: '../node_modules',
      // НЕ клади react/react-dom в additionalDepsToLink — будет duplicate React
    },
  ],
})
```

### Peer deps / React

Packalink линкует **файлы** `dist` симлинками. Node резолвит импорты по
realpath → уходит в `node_modules` репозитория библиотеки → второй `react` →
`Invalid hook call`.

По умолчанию (`dedupePeers: true`) packalink после линковки кладёт симлинки
peers **проекта** рядом с dist:

`<linkedDist>/node_modules/react` → `<project>/node_modules/react`

Так linked-код видит тот же React, что и приложение. Не нужен
`--preserve-symlinks` (он ломает pnpm nested deps вроде `history`).

```js
dedupePeers: true,           // default — все peerDependencies из package.json
dedupePeers: ['react', 'react-dom'],
dedupePeers: false,          // выключить
```

```bash
npx --yes packalink
```
