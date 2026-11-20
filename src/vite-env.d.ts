/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** marketplace-service origin, without a trailing slash. */
  readonly VITE_MARKETPLACE_API_URL?: string;
  /** Set to `true` to poll the file watcher (macOS bind mounts). */
  readonly VITE_USE_POLLING?: string;
  readonly VITE_DEV_PORT?: string;
  readonly VITE_DEV_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
