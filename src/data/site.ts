import config from '../../config.yml?raw';
import { parseSiteConfig } from '../lib/site-config';

const siteConfig = parseSiteConfig(config);

export const site = {
  url: siteConfig.siteUrl,
  name: siteConfig.siteName['zh-TW'] ?? siteConfig.siteName['zh-CN'] ?? siteConfig.siteName.en ?? 'JS.Gripe',
  shortName: siteConfig.shortName,
  zhName: siteConfig.zhName['zh-TW'] ?? siteConfig.zhName['zh-CN'] ?? '技訴',
  description: siteConfig.description.en ?? siteConfig.description['zh-TW'] ?? '',
  icon: siteConfig.icons.ogImage ?? '/assets/brand/site-icon.png',
  favicon: siteConfig.icons.favicon ?? '/assets/brand/site-icon.png',
  appleTouchIcon: siteConfig.icons.appleTouchIcon ?? '/assets/brand/site-icon.png',
  ogImage: siteConfig.icons.ogImage ?? '/assets/brand/site-icon.png',
  mascot: siteConfig.icons.mascot ?? '/assets/brand/mascot-sheet.png',
  blogUrl: siteConfig.blogUrl
} as const;
