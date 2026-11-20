import { Link, useParams } from 'react-router-dom';
import { ConfigSnippet } from '@/components/ConfigSnippet';
import { InstallButton } from '@/components/InstallButton';
import { PermissionsList } from '@/components/PermissionsList';
import { PublisherBadge } from '@/components/PublisherBadge';
import { ScreenshotGallery } from '@/components/ScreenshotGallery';
import { useDirectory } from '@/context/DirectoryContext';
import { useHost } from '@/context/HostContext';
import { categoryLabel } from '@/lib/catalog';
import { formatInstallCount, formatUpdated } from '@/lib/format';

export function DetailPage() {
  const { slug } = useParams();
  const { apps, categories } = useDirectory();
  const host = useHost();
  const app = apps.find((item) => item.slug === slug);

  if (!app) {
    return (
      <main className="mx-auto max-w-page px-4 py-16 sm:px-6">
        <h1 className="font-heading text-2xl font-semibold">This app is not in the directory</h1>
        <p className="mt-3">
          <Link
            className="text-primary-ink underline"
            to="/"
          >
            Back to the directory
          </Link>
        </p>
      </main>
    );
  }

  const installed = host.installed.has(app.slug);

  return (
    <main className="mx-auto max-w-page px-4 py-8 sm:px-6">
      <p className="text-sm">
        <Link
          to="/"
          className="text-primary-ink underline"
        >
          Directory
        </Link>
      </p>
      <div className="mt-6 flex flex-wrap items-start gap-4">
        <img
          src={app.icon}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{app.name}</h1>
          <p className="mt-2 text-lg leading-7 text-muted-foreground">{app.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PublisherBadge kind={app.publisher.kind} />
            {installed ? (
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary-ink">
                Installed
              </span>
            ) : null}
            <span className="text-sm text-muted-foreground">
              {categoryLabel(categories, app.category)}
            </span>
          </div>
        </div>
        <InstallButton app={app} />
      </div>

      {host.status === 'missing' ? (
        <p className="mt-6 text-sm text-muted-foreground">
          This Shellui host has no marketplace install API yet. Copy the navigation item, or run the
          CLI command.
        </p>
      ) : null}

      <div className="mt-8">
        <ScreenshotGallery shots={app.screenshots} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-10">
          <section aria-labelledby="about-title">
            <h2
              id="about-title"
              className="font-heading text-lg font-semibold"
            >
              About
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7">{app.description}</p>
          </section>
          <PermissionsList capabilities={app.capabilities} />
          <ConfigSnippet app={app} />
        </div>
        <aside className="h-fit rounded-xl border border-border bg-card p-5 text-sm leading-6">
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold">Publisher</dt>
              <dd className="text-muted-foreground">
                {app.publisher.url ? (
                  <a
                    className="underline"
                    href={app.publisher.url}
                    rel="noreferrer"
                  >
                    {app.publisher.name}
                  </a>
                ) : (
                  app.publisher.name
                )}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Version</dt>
              <dd className="text-muted-foreground">{app.version}</dd>
            </div>
            <div>
              <dt className="font-semibold">Installs</dt>
              <dd className="text-muted-foreground">{formatInstallCount(app.installCount)}</dd>
            </div>
            <div>
              <dt className="font-semibold">Updated</dt>
              <dd className="text-muted-foreground">{formatUpdated(app.updatedAt)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-col gap-2">
            {app.homepage ? (
              <a
                className="font-semibold text-primary-ink underline"
                href={app.homepage}
                rel="noreferrer"
              >
                Homepage
              </a>
            ) : null}
            {app.support ? (
              <a
                className="font-semibold text-primary-ink underline"
                href={app.support}
                rel="noreferrer"
              >
                Support
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
