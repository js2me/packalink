import { defineConfig } from 'docusite';

export default defineConfig({
  title: 'packalink',
  description:
    'Symlink-based local development linking tool for Node.js packages',
  github: 'https://github.com/js2me/packalink',
  colors: { light: '#3b82f6', dark: '#1d4ed8' },
  search: 'local',
  base: '/packalink/',
  nav: [
    { text: 'Введение', link: '/introduction/getting-started' },
    { text: 'Руководство', link: '/guide/configuration' },
    { text: 'API', link: '/api/define-config' },
  ],
  sidebar: {
    '/': [
      {
        text: 'Введение',
        items: [
          { text: 'Начало работы', link: '/introduction/getting-started' },
          { text: 'Проблема duplicate React', link: '/introduction/problem' },
        ],
      },
      {
        text: 'Руководство',
        items: [
          { text: 'Конфигурация', link: '/guide/configuration' },
          { text: 'Линки', link: '/guide/links' },
          { text: 'Dedupe Peers', link: '/guide/dedupe-peers' },
          { text: 'Additional Deps', link: '/guide/additional-deps' },
          { text: 'CLI', link: '/guide/cli' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'defineConfig', link: '/api/define-config' },
          { text: 'run', link: '/api/run' },
        ],
      },
    ],
  },
});
