import type { MarketplaceApp, NavigationItem } from '@/lib/types';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isAppSlug(slug: string): boolean {
  return SLUG.test(slug);
}

export function navigationItemFor(app: MarketplaceApp): NavigationItem {
  return {
    label: app.navigation.label,
    path: app.navigation.path,
    url: app.navigation.url,
    icon: app.navigation.icon,
  };
}

export function navigationItemJson(app: MarketplaceApp): string {
  return JSON.stringify(navigationItemFor(app), null, 2);
}

export function cliCommand(slug: string): string | null {
  if (!isAppSlug(slug)) return null;
  return `shellui add ${slug}`;
}
