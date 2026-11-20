import type { NavigationItem } from '@/lib/types';

export interface InstallAppRequest {
  slug: string;
  version: string;
  navigation: NavigationItem;
}

export interface MarketplaceNamespace {
  listInstalledApps: () => Promise<unknown>;
  installApp: (request: InstallAppRequest) => Promise<unknown>;
  uninstallApp: (slug: string) => Promise<unknown>;
}

export function readMarketplace(shell: object): MarketplaceNamespace | null {
  const candidate = (shell as { marketplace?: unknown }).marketplace;
  if (!candidate || typeof candidate !== 'object') return null;
  const api = candidate as Partial<MarketplaceNamespace>;
  if (
    typeof api.listInstalledApps !== 'function' ||
    typeof api.installApp !== 'function' ||
    typeof api.uninstallApp !== 'function'
  ) {
    return null;
  }
  return {
    listInstalledApps: () => api.listInstalledApps!(),
    installApp: (request) => api.installApp!(request),
    uninstallApp: (slug) => api.uninstallApp!(slug),
  };
}

export function normalizeInstalledApps(payload: unknown): string[] {
  if (!Array.isArray(payload)) return [];
  const slugs: string[] = [];
  for (const item of payload) {
    if (typeof item === 'string' && item.trim()) {
      slugs.push(item.trim());
      continue;
    }
    if (item && typeof item === 'object' && 'slug' in item) {
      const slug = (item as { slug?: unknown }).slug;
      if (typeof slug === 'string' && slug.trim()) slugs.push(slug.trim());
    }
  }
  return slugs;
}
