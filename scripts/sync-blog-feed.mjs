import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { readSiteConfig } from './read-site-config.mjs';

const languages = ['zh-CN', 'zh-TW', 'en'];
const site = await readSiteConfig();
const blogBaseUrl = site.blogUrl;
const localBlogPublicDir = path.resolve(process.env.BLOG_PUBLIC_DIR ?? findDefaultBlogPublicDir());
const outputPath = path.resolve('src/data/blog-posts.json');
const maxPosts = 5;
const timeoutMs = 8000;

const previous = await readPreviousPosts();
const next = Object.fromEntries(languages.map((lang) => [lang, previous[lang] ?? []]));

for (const lang of languages) {
  const feedUrl = new URL(`${lang}/feed.xml`, blogBaseUrl).toString();
  const localFeedPath = path.join(localBlogPublicDir, lang, 'feed.xml');

  try {
    const xml = await readLocalText(localFeedPath).catch(() => fetchText(feedUrl));
    next[lang] = parseFeed(xml, feedUrl).slice(0, maxPosts);
    console.log(`[blog-feed] ${lang}: synced ${next[lang].length} post(s)`);
  } catch (error) {
    console.warn(`[blog-feed] ${lang}: kept ${next[lang].length} existing post(s); ${formatError(error)}`);
  }
}

await fs.writeFile(outputPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');

async function readLocalText(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function readPreviousPosts() {
  try {
    const parsed = JSON.parse(await fs.readFile(outputPath, 'utf8'));
    return Object.fromEntries(languages.map((lang) => [lang, Array.isArray(parsed?.[lang]) ? parsed[lang] : []]));
  } catch {
    return Object.fromEntries(languages.map((lang) => [lang, []]));
  }
}

function findDefaultBlogPublicDir() {
  const candidates = [
    '/opt/myblog/public',
    '../myblog/public'
  ];

  for (const candidate of candidates) {
    try {
      const resolved = path.resolve(candidate);
      if (resolved && fsSync.existsSync(resolved) && fsSync.statSync(resolved).isDirectory()) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  return '../myblog/public';
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'user-agent': 'js.gripe static build feed sync'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseFeed(xml, baseUrl) {
  const blocks = extractBlocks(xml, 'item');
  const entries = blocks.length > 0 ? blocks : extractBlocks(xml, 'entry');

  return entries
    .map((block, index) => {
      const title = cleanText(getTagText(block, ['title']));
      const url = normalizeUrl(getLink(block), baseUrl);
      const date = cleanText(getTagText(block, ['pubDate', 'updated', 'published', 'dc:date']));
      const excerpt = summarize(getTagText(block, ['description', 'summary', 'content:encoded']));
      const timestamp = date ? Date.parse(date) : 0;

      return { post: { title, url, date: Number.isNaN(timestamp) ? undefined : date, excerpt }, index, timestamp };
    })
    .filter(({ post }) => post.title && post.url)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0) || a.index - b.index)
    .map(({ post }) => post);
}

function extractBlocks(xml, tag) {
  return [...xml.matchAll(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'))].map((match) => match[0]);
}

function getTagText(block, tags) {
  for (const tag of tags) {
    const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = block.match(new RegExp(`<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
    if (match?.[1]) {
      return unwrapCdata(match[1]);
    }
  }

  return '';
}

function getLink(block) {
  const linkTags = [...block.matchAll(/<link\b([^>]*)>/gi)];
  const alternate = linkTags
    .map((match) => ({ href: getAttribute(match[1], 'href'), rel: getAttribute(match[1], 'rel') }))
    .find((link) => link.href && (!link.rel || link.rel === 'alternate'));

  if (alternate?.href) {
    return alternate.href;
  }

  return getTagText(block, ['link', 'guid', 'id']);
}

function getAttribute(attrs, name) {
  const match = attrs.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
  return match?.[1] ? decodeXml(match[1]) : '';
}

function normalizeUrl(value, baseUrl) {
  try {
    return new URL(cleanText(value), baseUrl).toString();
  } catch {
    return '';
  }
}

function summarize(value) {
  const text = cleanText(value.replace(/<[^>]+>/g, ' '));
  return text ? `${text.slice(0, 148)}${text.length > 148 ? '...' : ''}` : undefined;
}

function cleanText(value) {
  return decodeXml(unwrapCdata(value))
    .replace(/\s+/g, ' ')
    .trim();
}

function unwrapCdata(value) {
  return value.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '');
}

function decodeXml(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
    if (code[0] === '#') {
      const base = code[1]?.toLowerCase() === 'x' ? 16 : 10;
      const parsed = Number.parseInt(code.slice(base === 16 ? 2 : 1), base);
      return Number.isNaN(parsed) ? entity : String.fromCodePoint(parsed);
    }

    return (
      {
        amp: '&',
        apos: "'",
        gt: '>',
        lt: '<',
        nbsp: ' ',
        quot: '"'
      }[code.toLowerCase()] ?? entity
    );
  });
}

function formatError(error) {
  if (error instanceof Error) {
    return error.cause ? `${error.message}: ${error.cause}` : error.message;
  }

  return String(error);
}
