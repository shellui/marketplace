import type { Capability } from '@/lib/types';

export const CAPABILITY_COPY: Record<Capability, { title: string; detail: string }> = {
  theme: {
    title: 'Theme',
    detail: 'Reads the shell theme, including light or dark mode and your color scheme.',
  },
  locale: {
    title: 'Locale',
    detail: 'Reads the active language so labels match the shell.',
  },
  ui: {
    title: 'Interface',
    detail: 'Opens toasts, dialogs, and drawers through the shell.',
  },
  navigate: {
    title: 'Navigation',
    detail: 'Asks the shell to open a route.',
  },
  storage: {
    title: 'Storage',
    detail: 'Reads and writes files through storage-service.',
  },
  ai: {
    title: 'AI',
    detail: 'Calls on-device models through the shell when Settings, then AI, allows it.',
  },
};
