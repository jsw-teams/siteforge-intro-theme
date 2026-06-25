import type { Lang, PageKey } from '../i18n/config';

type Frontmatter = {
  title?: string;
  lead?: string;
};

export type ContentPage = Frontmatter & {
  html: string;
};

const files = import.meta.glob('../../content/pages/*/index.*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

export function getContentPage(page: PageKey, lang: Lang): ContentPage | undefined {
  const raw = files[`../../content/pages/${page}/index.${lang}.md`];
  if (!raw) return undefined;
  const { frontmatter, body } = parseFrontmatter(raw);
  return { ...frontmatter, html: renderMarkdown(body) };
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  if (!raw.startsWith('---')) return { frontmatter: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return { frontmatter: {}, body: raw };
  const frontmatter = Object.fromEntries(
    raw
      .slice(3, end)
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Za-z0-9_-]+):\s*"?(.+?)"?\s*$/))
      .filter((match): match is RegExpMatchArray => !!match)
      .map((match) => [match[1], match[2]])
  );
  return { frontmatter, body: raw.slice(end + 4).trim() };
}

function renderMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let list: string[] = [];

  function flushList() {
    if (list.length === 0) return;
    html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`);
    list = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith('<')) {
      flushList();
      html.push(trimmed);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      html.push(`<h3>${inline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      html.push(`<h2>${inline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      html.push(`<h1>${inline(trimmed.slice(2))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('- ')) {
      list.push(trimmed.slice(2));
      continue;
    }
    flushList();
    html.push(`<p>${inline(trimmed)}</p>`);
  }

  flushList();
  return html.join('\n');
}

function inline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
