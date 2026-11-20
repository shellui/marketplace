import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { shellui, type Appearance } from '@shellui/sdk';
import { isEmbeddedInShell } from '@/lib/embed';
import { applyColorMode, applyThemeToDocument, resolvedStandaloneMode } from '@/lib/theme';

type Scheme = 'light' | 'dark' | 'system';

interface ThemeControls {
  embedded: boolean;
  scheme: Scheme;
  setScheme: (scheme: Scheme) => void;
}

const ThemeContext = createContext<ThemeControls | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<Scheme>('system');
  const embedded = isEmbeddedInShell();

  useEffect(() => {
    if (embedded) {
      applyThemeToDocument(shellui.initialSettings?.appearance ?? null);
      const onMessage = (message: { payload?: unknown }) => {
        const appearance = appearanceFromPayload(message.payload);
        if (appearance) applyThemeToDocument(appearance);
      };
      const stopUpdated = shellui.addMessageListener('SHELLUI_SETTINGS_UPDATED', onMessage);
      const stopSettings = shellui.addMessageListener('SHELLUI_SETTINGS', onMessage);
      return () => {
        stopUpdated();
        stopSettings();
      };
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => applyColorMode(resolvedStandaloneMode(scheme, media.matches));
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [embedded, scheme]);

  const value = useMemo(() => ({ embedded, scheme, setScheme }), [embedded, scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeControls {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}

function appearanceFromPayload(payload: unknown): Appearance | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as { settings?: { appearance?: Appearance }; appearance?: Appearance };
  return record.settings?.appearance ?? record.appearance ?? null;
}
