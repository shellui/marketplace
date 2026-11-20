import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InstallButton } from '@/components/InstallButton';
import { PublisherBadge } from '@/components/PublisherBadge';
import { useDirectory } from '@/context/DirectoryContext';
import { useHost } from '@/context/HostContext';
import { categoryLabel } from '@/lib/catalog';
import { navigationItemJson } from '@/lib/configSnippet';
import { formatInstallCount } from '@/lib/format';
import type { MarketplaceApp } from '@/lib/types';

export function AppCard({ app }: { app: MarketplaceApp }) {
  const { categories } = useDirectory();
  const host = useHost();
  const installed = host.installed.has(app.slug);
  const headingId = `app-${app.slug}`;

  return (
    <article
      aria-labelledby={headingId}
      className="flex h-full flex-col rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-start gap-3">
        <img
          src={app.icon}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <h3
            id={headingId}
            className="font-heading text-base font-semibold"
          >
            <Link
              to={`/apps/${app.slug}`}
              className="hover:underline"
            >
              {app.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {categoryLabel(categories, app.category)}
          </p>
        </div>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">{app.tagline}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <PublisherBadge kind={app.publisher.kind} />
        {installed ? (
          <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary-ink">
            Installed
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {formatInstallCount(app.installCount)}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <InstallButton app={app} />
        <CopyJsonButton app={app} />
      </div>
    </article>
  );
}

function CopyJsonButton({ app }: { app: MarketplaceApp }) {
  const [label, setLabel] = useState('Copy config JSON');

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(navigationItemJson(app));
      setLabel('Copied');
    } catch {
      setLabel('Copy failed');
    }
  }

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md border border-border px-3.5 py-2.5 text-sm font-semibold"
      onClick={() => void onCopy()}
    >
      {label}
    </button>
  );
}
