import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { shellui } from '@shellui/sdk';
import { pingInstall, pingUninstall } from '@/lib/api';
import { isEmbeddedInShell } from '@/lib/embed';
import { normalizeInstalledApps, readMarketplace } from '@/lib/host';
import type { MarketplaceApp } from '@/lib/types';

type HostStatus = 'standalone' | 'pending' | 'ready' | 'missing';

interface HostState {
  status: HostStatus;
  embedded: boolean;
  marketplaceAvailable: boolean;
  installed: Set<string>;
  pendingSlug: string | null;
  error: string | null;
  install: (app: MarketplaceApp) => Promise<void>;
  uninstall: (slug: string) => Promise<void>;
}

const HostContext = createContext<HostState | null>(null);

export function HostProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<HostStatus>('pending');
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEmbeddedInShell()) {
      setStatus('standalone');
      return;
    }
    const api = readMarketplace(shellui);
    if (!api) {
      setStatus('missing');
      return;
    }
    setStatus('ready');
    let active = true;
    void api
      .listInstalledApps()
      .then((payload) => {
        if (!active) return;
        setInstalled(new Set(normalizeInstalledApps(payload)));
      })
      .catch(() => {
        if (!active) return;
        setError('Installed apps could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, []);

  const install = useCallback(async (app: MarketplaceApp) => {
    const api = readMarketplace(shellui);
    if (!api) return;
    setPendingSlug(app.slug);
    setError(null);
    try {
      await api.installApp({
        slug: app.slug,
        version: app.version,
        navigation: app.navigation,
      });
      setInstalled((current) => new Set(current).add(app.slug));
      void pingInstall(app.slug);
    } catch {
      setError('Install failed. The shell did not add this app.');
    } finally {
      setPendingSlug(null);
    }
  }, []);

  const uninstall = useCallback(async (slug: string) => {
    const api = readMarketplace(shellui);
    if (!api) return;
    setPendingSlug(slug);
    setError(null);
    try {
      await api.uninstallApp(slug);
      setInstalled((current) => {
        const next = new Set(current);
        next.delete(slug);
        return next;
      });
      void pingUninstall(slug);
    } catch {
      setError('Remove failed. The shell did not remove this app.');
    } finally {
      setPendingSlug(null);
    }
  }, []);

  const value = useMemo<HostState>(
    () => ({
      status,
      embedded: status !== 'standalone' && status !== 'pending',
      marketplaceAvailable: status === 'ready',
      installed,
      pendingSlug,
      error,
      install,
      uninstall,
    }),
    [status, installed, pendingSlug, error, install, uninstall],
  );

  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
}

export function useHost(): HostState {
  const value = useContext(HostContext);
  if (!value) throw new Error('useHost must be used inside HostProvider');
  return value;
}
