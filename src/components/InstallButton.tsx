import type { MarketplaceApp } from '@/lib/types';
import { useHost } from '@/context/HostContext';

export function InstallButton({ app }: { app: MarketplaceApp }) {
  const host = useHost();
  if (!host.marketplaceAvailable) return null;

  const installed = host.installed.has(app.slug);
  const pending = host.pendingSlug === app.slug;

  if (installed) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground disabled:opacity-50"
        disabled={pending}
        onClick={() => void host.uninstall(app.slug)}
      >
        {pending ? 'Removing…' : 'Remove'}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      disabled={pending}
      onClick={() => void host.install(app)}
    >
      {pending ? 'Installing…' : 'Install'}
    </button>
  );
}
