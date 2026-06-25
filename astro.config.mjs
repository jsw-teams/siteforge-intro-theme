import { defineConfig } from 'astro/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import { readSiteConfig } from './scripts/read-site-config.mjs';

const site = await readSiteConfig();
const sitemapOptions = site.sitemap || {};

export default defineConfig({
  output: 'static',
  site: site.siteUrl,
  integrations: [
    sitemap({
      entryLimit: Number(sitemapOptions.entryLimit || 50000),
      filter: (page) => !page.endsWith('/404.html')
    }),
    {
      name: 'single-sitemap-output',
      hooks: {
        async 'astro:build:done'({ dir }) {
          const outputDir = fileURLToPath(dir);
          const source = path.join(outputDir, 'sitemap-0.xml');
          const target = path.join(outputDir, 'sitemap.xml');
          const xml = await fs.readFile(source, 'utf8');

          if (!xml.includes('<urlset') || xml.includes('<sitemapindex')) {
            throw new Error('@astrojs/sitemap did not generate a URL sitemap at sitemap-0.xml');
          }

          await fs.writeFile(target, xml);
          await Promise.all([
            fs.rm(path.join(outputDir, 'sitemap-index.xml'), { force: true }),
            fs.rm(source, { force: true })
          ]);
        }
      }
    }
  ]
});
