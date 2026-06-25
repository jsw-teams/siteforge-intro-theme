export type SiteConfig = {
  siteUrl: string;
  blogUrl: string;
  defaultLocale: string;
  activeLocales: string[];
  siteName: Record<string, string>;
  shortName: string;
  zhName: Record<string, string>;
  description: Record<string, string>;
  icons: Record<string, string>;
};

export function parseSiteConfig(raw: string): SiteConfig {
  return {
    siteUrl: readRequiredScalar(raw, 'siteUrl'),
    blogUrl: readRequiredScalar(raw, 'blogUrl'),
    defaultLocale: readScalar(raw, 'defaultLocale', 'zh-TW'),
    activeLocales: readList(raw, 'activeLocales', ['zh-CN', 'zh-TW', 'en']),
    siteName: readMap(raw, 'siteName'),
    shortName: readScalar(raw, 'shortName', 'JS.Gripe'),
    zhName: readMap(raw, 'zhName'),
    description: readMap(raw, 'description'),
    icons: readMap(raw, 'icons')
  };
}

function readScalar(raw: string, key: string, fallback = '') {
  const match = raw.match(new RegExp(`^${escapeRegExp(key)}:\\s*(.+?)\\s*$`, 'm'));
  return match ? unquote(match[1]) : fallback;
}

function readRequiredScalar(raw: string, key: string) {
  const value = readScalar(raw, key);
  if (!value) throw new Error(`Missing required config.yml field: ${key}`);
  return value;
}

function readMap(raw: string, key: string) {
  const block = readBlock(raw, key);
  const values: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^  ([\w-]+):\s*(.+?)\s*$/);
    if (match) values[match[1]] = unquote(match[2]);
  }
  return values;
}

function readList(raw: string, key: string, fallback: string[]) {
  const block = readBlock(raw, key);
  const values: string[] = [];
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^  -\s*(.+?)\s*$/);
    if (match) values.push(unquote(match[1]));
  }
  return values.length ? values : fallback;
}

function readBlock(raw: string, key: string) {
  const start = raw.search(new RegExp(`^${escapeRegExp(key)}:\\s*$`, 'm'));
  if (start < 0) return '';
  const rest = raw.slice(start).split(/\r?\n/).slice(1);
  const lines: string[] = [];
  for (const line of rest) {
    if (line.trim() && !line.startsWith('  ')) break;
    lines.push(line);
  }
  return lines.join('\n');
}

function unquote(value: string) {
  return String(value).trim().replace(/^["']|["']$/g, '');
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
