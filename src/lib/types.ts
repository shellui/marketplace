export const CAPABILITIES = ['theme', 'locale', 'ui', 'navigate', 'storage', 'ai'] as const;

export type Capability = (typeof CAPABILITIES)[number];

export type PublisherKind = 'official' | 'verified' | 'community';

export interface Publisher {
  name: string;
  kind: PublisherKind;
  url?: string;
}

/** Navigation item pasted into `navigation` in shellui.config.json. */
export interface NavigationItem {
  label: string;
  path: string;
  url: string;
  icon: string;
}

export interface Screenshot {
  src: string;
  alt: string;
}

export interface MarketplaceApp {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  publisher: Publisher;
  category: string;
  version: string;
  homepage: string;
  support: string;
  icon: string;
  screenshots: Screenshot[];
  installCount: number;
  updatedAt: string;
  featured: boolean;
  capabilities: Capability[];
  navigation: NavigationItem;
}

export interface Category {
  id: string;
  label: string;
}

export type DirectorySource = 'api' | 'local';
