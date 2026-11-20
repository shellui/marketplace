import type { MarketplaceApp } from '@/lib/types';

export type SortKey = 'popular' | 'recent' | 'name';
export type SourceFilter = 'all' | 'official' | 'community';

export interface DirectoryQuery {
  query: string;
  category: string;
  source: SourceFilter;
  sort: SortKey;
}

export function filterAndSortApps(apps: MarketplaceApp[], query: DirectoryQuery): MarketplaceApp[] {
  const needle = query.query.trim().toLowerCase();
  const filtered = apps.filter((app) => {
    if (query.category !== 'all' && app.category !== query.category) return false;
    if (query.source === 'official' && app.publisher.kind !== 'official') return false;
    if (query.source === 'community' && app.publisher.kind === 'official') return false;
    if (!needle) return true;
    const haystack = [app.name, app.tagline, app.publisher.name, app.slug, app.category]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => compareApps(a, b, query.sort));
  return sorted;
}

function compareApps(a: MarketplaceApp, b: MarketplaceApp, sort: SortKey): number {
  if (sort === 'name') return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
  if (sort === 'recent') {
    const byDate = b.updatedAt.localeCompare(a.updatedAt);
    if (byDate !== 0) return byDate;
  }
  if (sort === 'popular' || sort === 'recent') {
    const byCount = b.installCount - a.installCount;
    if (sort === 'popular' && byCount !== 0) return byCount;
    if (sort === 'recent' && a.updatedAt === b.updatedAt && byCount !== 0) return byCount;
  }
  return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
}
