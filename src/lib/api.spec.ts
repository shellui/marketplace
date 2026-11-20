import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  appStatsPath,
  fetchApp,
  fetchApps,
  fetchCategories,
  loadDirectory,
  pingInstall,
} from '@/lib/api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('marketplace API client', () => {
  it('builds install and uninstall stat URLs', () => {
    expect(appStatsPath('files', 'install')).toBe(
      'https://api.marketplace.shellui.com/api/apps/files/install',
    );
    expect(appStatsPath('status-board', 'uninstall')).toBe(
      'https://api.marketplace.shellui.com/api/apps/status-board/uninstall',
    );
  });

  it('reads apps and categories from the documented envelopes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/api/categories')) {
          return Response.json({ categories: [{ id: 'productivity', label: 'Productivity' }] });
        }
        if (url.endsWith('/api/apps/files')) {
          return Response.json({
            app: {
              slug: 'files',
              name: 'Files',
              tagline: 'Folders',
              homepage: 'https://files.shellui.com/',
              navigation: {
                label: 'Files',
                path: '/files',
                url: 'https://files.shellui.com/',
                icon: 'folder',
              },
              capabilities: ['storage', 'nope'],
            },
          });
        }
        return Response.json({
          apps: [
            { slug: 'files', name: 'Files', tagline: 'Folders', publisher: { kind: 'official' } },
          ],
        });
      }),
    );

    const apps = await fetchApps();
    expect(apps[0]?.slug).toBe('files');
    expect(apps[0]?.publisher.kind).toBe('official');
    const categories = await fetchCategories();
    expect(categories).toEqual([{ id: 'productivity', label: 'Productivity' }]);
    const files = await fetchApp('files');
    expect(files.navigation.path).toBe('/files');
    expect(files.capabilities).toEqual(['storage']);
  });

  it('keeps the caller on the local catalog when the API is down', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    await expect(loadDirectory()).resolves.toBeNull();
  });

  it('swallows a failed install ping', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('offline');
    });
    vi.stubGlobal('fetch', fetchMock);
    await expect(pingInstall('files')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.marketplace.shellui.com/api/apps/files/install',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
