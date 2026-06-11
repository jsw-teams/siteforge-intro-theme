import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://js.gripe',
  base: process.env.GITHUB_PAGES === 'true' ? '/myweb' : '/',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404.html')
    })
  ]
});
