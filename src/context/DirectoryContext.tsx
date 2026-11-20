import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadDirectory, localDirectory } from '@/lib/api';
import type { Category, DirectorySource, MarketplaceApp } from '@/lib/types';

interface DirectoryState {
  apps: MarketplaceApp[];
  categories: Category[];
  source: DirectorySource;
  settled: boolean;
}

const DirectoryContext = createContext<DirectoryState | null>(null);

export function DirectoryProvider({ children }: { children: ReactNode }) {
  const local = localDirectory();
  const [apps, setApps] = useState<MarketplaceApp[]>(local.apps);
  const [categories, setCategories] = useState<Category[]>(local.categories);
  const [source, setSource] = useState<DirectorySource>('local');
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void loadDirectory(controller.signal).then((result) => {
      if (!active) return;
      if (result) {
        setApps(result.apps);
        setCategories(result.categories);
        setSource(result.source);
      } else {
        setSource('local');
      }
      setSettled(true);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const value = useMemo(
    () => ({ apps, categories, source, settled }),
    [apps, categories, source, settled],
  );

  return <DirectoryContext.Provider value={value}>{children}</DirectoryContext.Provider>;
}

export function useDirectory(): DirectoryState {
  const value = useContext(DirectoryContext);
  if (!value) throw new Error('useDirectory must be used inside DirectoryProvider');
  return value;
}
