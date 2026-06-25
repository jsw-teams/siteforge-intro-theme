import type { Lang } from '../i18n/config';

type FooterCopyright = {
  enabled: boolean;
  text: Partial<Record<Lang, string>>;
};

export function getFooterCopyright(themeConfig: string, lang: Lang, year: number): string {
  const copyright = readFooterCopyright(themeConfig);

  if (!copyright.enabled) return '';

  return (copyright.text[lang] ?? copyright.text['zh-TW'] ?? copyright.text['zh-CN'] ?? copyright.text.en ?? '')
    .replaceAll('{year}', String(year));
}

function readFooterCopyright(themeConfig: string): FooterCopyright {
  const result: FooterCopyright = {
    enabled: true,
    text: {}
  };
  const lines = themeConfig.split(/\r?\n/);
  let scope = '';

  for (const line of lines) {
    if (/^\S/.test(line)) {
      scope = line.startsWith('footer:') ? 'footer' : '';
      continue;
    }

    if (scope === 'footer' && /^  copyright:\s*$/.test(line)) {
      scope = 'copyright';
      continue;
    }

    if (scope === 'copyright') {
      const enabled = line.match(/^    enabled:\s*(true|false)\s*$/);
      if (enabled) {
        result.enabled = enabled[1] === 'true';
        continue;
      }

      const text = line.match(/^      (zh-CN|zh-TW|en):\s*["']?(.+?)["']?\s*$/);
      if (text) result.text[text[1] as Lang] = text[2];

      if (/^  [a-zA-Z]/.test(line)) break;
    }
  }

  return result;
}
