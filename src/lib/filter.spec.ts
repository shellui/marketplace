import { describe, expect, it } from 'vitest';
import { SEED_APPS } from '@/lib/catalog';
import { filterAndSortApps } from '@/lib/filter';

const base = { query: '', category: 'all', source: 'all' as const, sort: 'popular' as const };

describe('filterAndSortApps', () => {
  it('filters by search, category, and publisher', () => {
    expect(
      filterAndSortApps(SEED_APPS, { ...base, query: 'notes' }).map((app) => app.slug),
    ).toEqual(['notes']);
    expect(
      filterAndSortApps(SEED_APPS, { ...base, category: 'documentation' }).map((app) => app.slug),
    ).toEqual(['docs']);
    expect(
      filterAndSortApps(SEED_APPS, { ...base, source: 'official' }).every(
        (app) => app.publisher.kind === 'official',
      ),
    ).toBe(true);
    const community = filterAndSortApps(SEED_APPS, { ...base, source: 'community' });
    expect(community.map((app) => app.slug).sort()).toEqual(['notes', 'status-board']);
  });

  it('sorts by popular, recent, and name', () => {
    expect(filterAndSortApps(SEED_APPS, base).map((app) => app.slug)[0]).toBe('docs');
    expect(
      filterAndSortApps(SEED_APPS, { ...base, sort: 'recent' }).map((app) => app.slug)[0],
    ).toBe('docs');
    expect(filterAndSortApps(SEED_APPS, { ...base, sort: 'name' }).map((app) => app.name)[0]).toBe(
      'Admin',
    );
  });
});
