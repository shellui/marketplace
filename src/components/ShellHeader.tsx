import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export function ShellHeader() {
  const theme = useTheme();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="font-heading text-base font-semibold tracking-tight"
        >
          Shellui Marketplace
        </Link>
        {theme.embedded ? null : (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Color scheme
            <select
              className="rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
              value={theme.scheme}
              onChange={(event) =>
                theme.setScheme(event.target.value as 'light' | 'dark' | 'system')
              }
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        )}
      </div>
    </header>
  );
}
