import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppCard } from '@/components/AppCard';
import { useDirectory } from '@/context/DirectoryContext';
import { useHost } from '@/context/HostContext';
import { filterAndSortApps, type SortKey, type SourceFilter } from '@/lib/filter';

export function BrowsePage() {
  const { apps, categories, source, settled } = useDirectory();
  const host = useHost();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [publisher, setPublisher] = useState<SourceFilter>('all');
  const [sort, setSort] = useState<SortKey>('popular');

  const results = useMemo(
    () => filterAndSortApps(apps, { query, category, source: publisher, sort }),
    [apps, query, category, publisher, sort],
  );

  const featured = apps.filter((app) => app.featured && app.publisher.kind === 'official');
  const filtersActive = query.trim() !== '' || category !== 'all' || publisher !== 'all';

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-page items-start gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              Shellui Marketplace
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-7 text-muted-foreground">
              Browse apps you can add to a Shellui shell. Install from the shell, or copy a
              navigation item into shellui.config.json.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Every listing in 0.9 is free to install.
            </p>
          </div>
          {filtersActive ? null : (
            <div>
              <h2 className="text-sm font-semibold text-foreground">Official Shellui apps</h2>
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
                {featured.map((app) => (
                  <li key={app.slug}>
                    <Link
                      to={`/apps/${app.slug}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
                    >
                      <img
                        src={app.icon}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-lg"
                      />
                      <span>
                        <span className="block text-sm font-semibold">{app.name}</span>
                        <span className="block text-sm text-muted-foreground">{app.tagline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section
        aria-label="Directory"
        className="mx-auto max-w-page px-4 py-10 sm:px-6"
      >
        <div className="flex flex-col gap-4">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <label
              htmlFor="search"
              className="text-sm font-semibold"
            >
              Search apps
            </label>
            <input
              id="search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, tagline, or publisher"
              className="mt-2 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm"
            />
          </form>

          <div
            role="group"
            aria-label="Category"
            className="flex flex-wrap gap-2"
          >
            <FilterChip
              pressed={category === 'all'}
              onClick={() => setCategory('all')}
            >
              All
            </FilterChip>
            {categories.map((item) => (
              <FilterChip
                key={item.id}
                pressed={category === item.id}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Publisher"
              className="flex flex-wrap gap-2"
            >
              <FilterChip
                pressed={publisher === 'all'}
                onClick={() => setPublisher('all')}
              >
                All
              </FilterChip>
              <FilterChip
                pressed={publisher === 'official'}
                onClick={() => setPublisher('official')}
              >
                Official
              </FilterChip>
              <FilterChip
                pressed={publisher === 'community'}
                onClick={() => setPublisher('community')}
              >
                Community
              </FilterChip>
            </div>
            <label className="flex items-center gap-2 text-sm">
              Sort
              <select
                className="rounded-md border border-border bg-card px-2 py-1.5 text-sm"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
              >
                <option value="popular">Popular</option>
                <option value="recent">Recent</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        </div>

        {host.status === 'missing' ? (
          <p className="mt-6 text-sm text-muted-foreground">
            This Shellui host has no marketplace install API yet. Copy the navigation item, or run
            the CLI command.
          </p>
        ) : null}

        <p
          className="mt-6 text-sm text-muted-foreground"
          aria-live="polite"
        >
          {results.length} {results.length === 1 ? 'app' : 'apps'}
        </p>

        {results.length === 0 ? (
          <p className="mt-6 text-sm">No apps match this search.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((app) => (
              <li key={app.slug}>
                <AppCard app={app} />
              </li>
            ))}
          </ul>
        )}

        {settled && source === 'local' ? (
          <p className="mt-10 text-xs text-muted-foreground">Showing the local catalog.</p>
        ) : null}
      </section>
    </main>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={
        pressed
          ? 'rounded-full bg-foreground px-3 py-1.5 text-sm font-semibold text-background'
          : 'rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground'
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}
