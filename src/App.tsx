import { Link, Route, Routes } from 'react-router-dom';
import { BrowsePage } from '@/components/BrowsePage';
import { DetailPage } from '@/components/DetailPage';
import { ShellHeader } from '@/components/ShellHeader';
import { useHost } from '@/context/HostContext';

export function App() {
  const host = useHost();

  return (
    <div className="min-h-screen">
      <ShellHeader />
      {host.error ? (
        <p
          role="alert"
          className="mx-auto max-w-page px-4 pt-4 text-sm text-destructive sm:px-6"
        >
          {host.error}
        </p>
      ) : null}
      <Routes>
        <Route
          path="/"
          element={<BrowsePage />}
        />
        <Route
          path="/apps/:slug"
          element={<DetailPage />}
        />
        <Route
          path="*"
          element={
            <main className="mx-auto max-w-page px-4 py-16 sm:px-6">
              <h1 className="font-heading text-2xl font-semibold">
                This page is not in the directory
              </h1>
              <p className="mt-3 text-muted-foreground">
                <Link
                  className="text-primary-ink underline"
                  to="/"
                >
                  Back to Shellui Marketplace
                </Link>
              </p>
            </main>
          }
        />
      </Routes>
    </div>
  );
}
