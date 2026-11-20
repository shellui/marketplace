import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { shellui } from '@shellui/sdk';
import { App } from '@/App';
import { AppProviders } from '@/AppProviders';
import { isEmbeddedInShell } from '@/lib/embed';
import { applyThemeToDocument } from '@/lib/theme';
import '@/index.css';

async function bootstrap() {
  const root = document.getElementById('root');
  if (!root) return;

  if (isEmbeddedInShell()) {
    try {
      await shellui.init();
      applyThemeToDocument(shellui.initialSettings?.appearance ?? null);
    } catch {
      // The directory still works if this host does not answer init.
    }
  }

  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <AppProviders>
          <App />
        </AppProviders>
      </BrowserRouter>
    </StrictMode>,
  );
}

void bootstrap();
