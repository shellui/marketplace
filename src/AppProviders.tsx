import type { ReactNode } from 'react';
import { DirectoryProvider } from '@/context/DirectoryContext';
import { HostProvider } from '@/context/HostContext';
import { ThemeProvider } from '@/context/ThemeContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DirectoryProvider>
        <HostProvider>{children}</HostProvider>
      </DirectoryProvider>
    </ThemeProvider>
  );
}
