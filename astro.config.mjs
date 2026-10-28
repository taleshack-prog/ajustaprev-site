// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/data/site.ts';

// Saída estática (SSG). Cada artigo do blog gera /blog/<slug>/index.html.
export default defineConfig({
  site: SITE.url,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // CSS pequeno vai inline no <head>: elimina requisição bloqueante.
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
