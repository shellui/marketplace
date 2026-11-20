import { describe, expect, it, vi } from 'vitest';
import { normalizeInstalledApps, readMarketplace, type InstallAppRequest } from '@/lib/host';

describe('marketplace host', () => {
  it('reads install methods when the host exposes them', () => {
    const listInstalledApps = vi.fn(async () => ['files']);
    const installApp = vi.fn(async () => undefined);
    const uninstallApp = vi.fn(async () => undefined);
    const api = readMarketplace({ marketplace: { listInstalledApps, installApp, uninstallApp } });
    expect(api).not.toBeNull();
  });

  it('returns null for an older host without marketplace', () => {
    expect(readMarketplace({})).toBeNull();
    expect(readMarketplace({ marketplace: { listInstalledApps: vi.fn() } })).toBeNull();
  });

  it('normalizes slug strings and records', () => {
    expect(normalizeInstalledApps(['files', { slug: 'docs' }, { slug: '' }, 3])).toEqual([
      'files',
      'docs',
    ]);
    expect(normalizeInstalledApps({ apps: ['files'] })).toEqual([]);
  });

  it('forwards the install request', async () => {
    const installApp = vi.fn(async () => undefined);
    const api = readMarketplace({
      marketplace: {
        listInstalledApps: async () => [],
        installApp,
        uninstallApp: async () => undefined,
      },
    });
    const request: InstallAppRequest = {
      slug: 'files',
      version: '0.3.0',
      navigation: {
        label: 'Files',
        path: '/files',
        url: 'https://files.shellui.com/',
        icon: 'folder',
      },
    };
    await api?.installApp(request);
    expect(installApp).toHaveBeenCalledWith(request);
  });
});
