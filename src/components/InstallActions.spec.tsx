import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shellui } from '@shellui/sdk';
import { renderApp } from '@/test/renderApp';

vi.mock('@/lib/embed', () => ({
  isEmbeddedInShell: () => true,
}));

interface MarketplaceDouble {
  listInstalledApps: ReturnType<typeof vi.fn>;
  installApp: ReturnType<typeof vi.fn>;
  uninstallApp: ReturnType<typeof vi.fn>;
}

function installMarketplace(list: unknown): MarketplaceDouble {
  const marketplace: MarketplaceDouble = {
    listInstalledApps: vi.fn(async () => list),
    installApp: vi.fn(async () => ({})),
    uninstallApp: vi.fn(async () => ({})),
  };
  (shellui as { marketplace?: MarketplaceDouble }).marketplace = marketplace;
  return marketplace;
}

describe('embedded install', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === 'POST') return new Response(null, { status: 204 });
        throw new Error('offline');
      }),
    );
  });

  it('installs through the SDK and pings marketplace-service', async () => {
    const user = userEvent.setup();
    const marketplace = installMarketplace([]);
    renderApp('/apps/files');

    await user.click(await screen.findByRole('button', { name: 'Install' }));
    expect(marketplace.installApp).toHaveBeenCalledWith({
      slug: 'files',
      version: '0.3.0',
      navigation: {
        label: 'Files',
        path: '/files',
        url: 'https://files.shellui.com/',
        icon: 'folder',
      },
    });
    expect(await screen.findByRole('button', { name: 'Remove' })).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(
      'https://api.marketplace.shellui.com/api/apps/files/install',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('removes an installed app and pings uninstall', async () => {
    const user = userEvent.setup();
    const marketplace = installMarketplace([{ slug: 'files' }]);
    renderApp('/apps/files');

    await user.click(await screen.findByRole('button', { name: 'Remove' }));
    expect(marketplace.uninstallApp).toHaveBeenCalledWith('files');
    expect(await screen.findByRole('button', { name: 'Install' })).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(
      'https://api.marketplace.shellui.com/api/apps/files/uninstall',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('shows an installed badge from listInstalledApps', async () => {
    installMarketplace(['docs']);
    renderApp('/');
    const docs = await screen.findByRole('article', { name: 'Docs' });
    expect(await within(docs).findByText('Installed')).toBeTruthy();
  });

  it('does not offer install on a host without marketplace', async () => {
    renderApp('/apps/admin');
    expect(await screen.findByText(/no marketplace install API yet/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Install' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Copy config JSON' })).toBeTruthy();
  });

  it('does not ping stats when the shell rejects install', async () => {
    const user = userEvent.setup();
    const marketplace = installMarketplace([]);
    marketplace.installApp.mockRejectedValueOnce(new Error('declined'));
    renderApp('/apps/notes');

    await user.click(await screen.findByRole('button', { name: 'Install' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    const posts = vi.mocked(fetch).mock.calls.filter((call) => {
      const init = call[1] as RequestInit | undefined;
      return init?.method === 'POST';
    });
    expect(posts).toHaveLength(0);
  });
});
