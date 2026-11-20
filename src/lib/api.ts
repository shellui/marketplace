import { SEED_APPS, SEED_CATEGORIES, categoriesFromApps } from '@/lib/catalog';
import {
  CAPABILITIES,
  type Capability,
  type Category,
  type MarketplaceApp,
  type PublisherKind,
} from '@/lib/types';

const DEFAULT_API = 'https://api.marketplace.shellui.com';

export function marketplaceApiBase(): string {
  const configured = import.meta.env.VITE_MARKETPLACE_API_URL;
  const value =
    typeof configured === 'string' && configured.trim() ? configured.trim() : DEFAULT_API;
  return value.replace(/\/+$/, '');
}

export function appStatsPath(slug: string, action: 'install' | 'uninstall'): string {
  return `${marketplaceApiBase()}/api/apps/${encodeURIComponent(slug)}/${action}`;
}

export async function fetchApps(signal?: AbortSignal): Promise<MarketplaceApp[]> {
  const response = await fetchJson(`${marketplaceApiBase()}/api/apps`, signal);
  const apps = unwrapList(response, 'apps')
    .map(normalizeApp)
    .filter((app): app is MarketplaceApp => app !== null);
  if (!apps.length) throw new Error('Marketplace API returned no apps');
  return apps;
}

export async function fetchApp(slug: string, signal?: AbortSignal): Promise<MarketplaceApp> {
  const response = await fetchJson(
    `${marketplaceApiBase()}/api/apps/${encodeURIComponent(slug)}`,
    signal,
  );
  const record =
    response && typeof response === 'object' && 'app' in response
      ? (response as { app: unknown }).app
      : response;
  const app = normalizeApp(record);
  if (!app) throw new Error('Marketplace API returned an unreadable app');
  return app;
}

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const response = await fetchJson(`${marketplaceApiBase()}/api/categories`, signal);
  return unwrapList(response, 'categories')
    .map(normalizeCategory)
    .filter((category): category is Category => category !== null);
}

export async function pingInstall(slug: string): Promise<void> {
  await ping(slug, 'install');
}

export async function pingUninstall(slug: string): Promise<void> {
  await ping(slug, 'uninstall');
}

export interface DirectoryLoad {
  apps: MarketplaceApp[];
  categories: Category[];
  source: 'api';
}

/**
 * Load the live directory. Returns null when the API is missing, slow, or
 * unreadable so the caller can keep the local catalog.
 */
export async function loadDirectory(signal?: AbortSignal): Promise<DirectoryLoad | null> {
  try {
    const apps = await fetchApps(signal);
    let categories: Category[] = [];
    try {
      categories = await fetchCategories(signal);
    } catch (error) {
      if (isAbort(error, signal)) return null;
      categories = [];
    }
    if (signal?.aborted) return null;
    return {
      apps,
      categories: categories.length ? categories : categoriesFromApps(apps),
      source: 'api',
    };
  } catch (error) {
    if (isAbort(error, signal)) return null;
    return null;
  }
}

export function localDirectory(): { apps: MarketplaceApp[]; categories: Category[] } {
  return { apps: SEED_APPS, categories: SEED_CATEGORIES };
}

async function ping(slug: string, action: 'install' | 'uninstall'): Promise<void> {
  try {
    await fetch(appStatsPath(slug, action), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: '{}',
    });
  } catch {
    // Stats are best-effort. Install already succeeded in the shell.
  }
}

async function fetchJson(url: string, parent?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  const onAbort = () => controller.abort();
  parent?.addEventListener('abort', onAbort);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Marketplace API ${response.status}`);
    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener('abort', onAbort);
  }
}

function unwrapList(payload: unknown, key: string): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && key in payload) {
    const value = (payload as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeCategory(value: unknown): Category | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const id = asString(raw.id);
  const label = asString(raw.label) ?? id;
  if (!id || !label) return null;
  return { id, label };
}

function normalizeApp(value: unknown): MarketplaceApp | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const slug = asString(raw.slug);
  const name = asString(raw.name);
  const tagline = asString(raw.tagline);
  if (!slug || !name || !tagline) return null;

  const publisherRaw = isRecord(raw.publisher) ? raw.publisher : {};
  const kind = asPublisherKind(publisherRaw.kind);
  const navigationRaw = isRecord(raw.navigation) ? raw.navigation : {};
  const homepage = asHttpUrl(raw.homepage) ?? '';
  const support = asHttpUrl(raw.support) ?? '';
  const navigationUrl = asHttpUrl(navigationRaw.url) ?? homepage;

  return {
    slug,
    name,
    tagline,
    description: asString(raw.description) ?? tagline,
    publisher: {
      name: asString(publisherRaw.name) ?? 'Community',
      kind,
      url: asHttpUrl(publisherRaw.url),
    },
    category: asString(raw.category) ?? 'utilities',
    version: asString(raw.version) ?? '0.0.0',
    homepage,
    support,
    icon: asString(raw.icon) ?? '/icons/files.svg',
    screenshots: normalizeScreenshots(raw.screenshots),
    installCount: asCount(raw.installCount),
    updatedAt: asString(raw.updatedAt) ?? '1970-01-01',
    featured: raw.featured === true || kind === 'official',
    capabilities: normalizeCapabilities(raw.capabilities),
    navigation: {
      label: asString(navigationRaw.label) ?? name,
      path: asString(navigationRaw.path) ?? `/${slug}`,
      url: navigationUrl || 'https://example.com/',
      icon: asString(navigationRaw.icon) ?? 'box',
    },
  };
}

function normalizeScreenshots(value: unknown): MarketplaceApp['screenshots'] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((shot) => {
    if (!isRecord(shot)) return [];
    const src = asString(shot.src);
    const alt = asString(shot.alt);
    if (!src || !alt) return [];
    return [{ src, alt }];
  });
}

function normalizeCapabilities(value: unknown): Capability[] {
  if (!Array.isArray(value)) return ['theme', 'locale', 'ui'];
  const allowed = new Set<string>(CAPABILITIES);
  const seen = new Set<Capability>();
  for (const item of value) {
    if (typeof item === 'string' && allowed.has(item)) seen.add(item as Capability);
  }
  return seen.size ? [...seen] : ['theme', 'locale', 'ui'];
}

function asPublisherKind(value: unknown): PublisherKind {
  if (value === 'official' || value === 'verified' || value === 'community') return value;
  return 'community';
}

function asCount(value: unknown): number {
  const count = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(count) || count < 0) return 0;
  return Math.floor(count);
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asHttpUrl(value: unknown): string | undefined {
  const text = asString(value);
  if (!text) return undefined;
  try {
    const url = new URL(text);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isAbort(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  return error instanceof DOMException && error.name === 'AbortError';
}
