# packalink  

[![NPM version][npm-image]][npm-url] [![test status][github-test-actions-image]][github-actions-url] [![build status][github-build-actions-image]][github-actions-url] [![npm download][download-image]][download-url] [![bundle size][bundlephobia-image]][bundlephobia-url]


[npm-image]: http://img.shields.io/npm/v/packalink.svg
[npm-url]: http://npmjs.org/package/packalink
[github-test-actions-image]: https://github.com/js2me/packalink/workflows/Test/badge.svg
[github-build-actions-image]: https://github.com/js2me/packalink/workflows/Build/badge.svg
[github-actions-url]: https://github.com/js2me/packalink/actions
[download-image]: https://img.shields.io/npm/dm/packalink.svg
[download-url]: https://npmjs.org/package/packalink
[bundlephobia-url]: https://bundlephobia.com/result?p=packalink
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
      depsPath: '../node_modules',
      additionalDepsToLink: ['react', 'react-dom'],
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
      additionalDepsToLink: ['react', 'react-dom', 'mobx-view-model'],
    },
  ],
})
```


```bash
npx --yes packalink
```