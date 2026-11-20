import { useState } from 'react';
import { cliCommand, navigationItemJson } from '@/lib/configSnippet';
import type { MarketplaceApp } from '@/lib/types';

type Tab = 'json' | 'cli';

export function ConfigSnippet({ app }: { app: MarketplaceApp }) {
  const [tab, setTab] = useState<Tab>('json');
  const [copied, setCopied] = useState<Tab | null>(null);
  const [copyError, setCopyError] = useState(false);
  const json = navigationItemJson(app);
  const command = cliCommand(app.slug);

  async function copy(value: string, which: Tab) {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
    } catch {
      setCopied(null);
      setCopyError(true);
    }
  }

  return (
    <section
      id="add-to-shell"
      aria-labelledby="add-to-shell-title"
      className="rounded-xl border border-border bg-card p-5"
    >
      <h2
        id="add-to-shell-title"
        className="font-heading text-lg font-semibold"
      >
        Add to the shell
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Paste this navigation item into the navigation array in shellui.config.json, or run the CLI
        command. Both work in a browser and inside a Shellui shell.
      </p>
      <div
        role="tablist"
        aria-label="Install snippet"
        className="mt-4 flex gap-2"
      >
        <TabButton
          selected={tab === 'json'}
          onClick={() => setTab('json')}
        >
          Config JSON
        </TabButton>
        <TabButton
          selected={tab === 'cli'}
          onClick={() => setTab('cli')}
        >
          CLI
        </TabButton>
      </div>
      {tab === 'json' ? (
        <div
          role="tabpanel"
          className="mt-4"
        >
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm leading-6">{json}</pre>
          <button
            type="button"
            className="mt-3 inline-flex rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground"
            onClick={() => void copy(json, 'json')}
          >
            {copied === 'json' ? 'Copied' : 'Copy config JSON'}
          </button>
        </div>
      ) : (
        <div
          role="tabpanel"
          className="mt-4"
        >
          {command ? (
            <>
              <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm leading-6">
                {command}
              </pre>
              <button
                type="button"
                className="mt-3 inline-flex rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground"
                onClick={() => void copy(command, 'cli')}
              >
                {copied === 'cli' ? 'Copied' : 'Copy CLI command'}
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              This app slug cannot be used in a CLI command.
            </p>
          )}
        </div>
      )}
      {copyError ? (
        <p
          role="alert"
          className="mt-3 text-sm text-destructive"
        >
          Copy failed. Select the snippet and copy it from there.
        </p>
      ) : null}
    </section>
  );
}

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={
        selected
          ? 'rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background'
          : 'rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground'
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}
