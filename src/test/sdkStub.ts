/**
 * Vitest stand-in for `@shellui/sdk`. The published SDK imports its own
 * package.json in a way this test runner rejects. The app build still uses
 * the real package. Do not import `@shellui/sdk` from this file: the test
 * alias would point that import back here.
 */
export const shellui = {
  init: async () => shellui,
  initialSettings: null as { appearance?: { mode: 'light' | 'dark' } | null } | null,
  addMessageListener: (_type: string, _listener: (message: { payload?: unknown }) => void) => () =>
    undefined,
};
