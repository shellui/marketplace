import type { Appearance } from '@shellui/sdk';

const KEY_TO_CSS_VAR: Record<string, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  radius: '--radius',
};

export function applyColorMode(mode: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.style.colorScheme = mode;
}

export function applyThemeToDocument(appearance: Appearance | null): void {
  const root = document.documentElement;
  if (!appearance) {
    applyColorMode('light');
    return;
  }

  applyColorMode(appearance.mode === 'dark' ? 'dark' : 'light');

  const colorsForMode = appearance.colors?.[appearance.mode];
  if (colorsForMode && typeof colorsForMode === 'object') {
    for (const [key, value] of Object.entries(colorsForMode)) {
      const cssVar = KEY_TO_CSS_VAR[key];
      if (cssVar && value != null) root.style.setProperty(cssVar, String(value));
    }
  }

  const bodyFont = appearance.bodyFontFamily ?? appearance.fontFamily;
  const headingFont = appearance.headingFontFamily ?? appearance.fontFamily;
  if (bodyFont) {
    root.style.setProperty('--font-body', bodyFont);
    document.body?.style.setProperty('font-family', bodyFont);
  }
  if (headingFont) root.style.setProperty('--font-heading', headingFont);
  if (appearance.lineHeight) root.style.setProperty('--line-height', appearance.lineHeight);
  if (appearance.letterSpacing)
    root.style.setProperty('--letter-spacing', appearance.letterSpacing);
}

export function resolvedStandaloneMode(
  scheme: 'light' | 'dark' | 'system',
  systemDark: boolean,
): 'light' | 'dark' {
  if (scheme === 'system') return systemDark ? 'dark' : 'light';
  return scheme;
}
