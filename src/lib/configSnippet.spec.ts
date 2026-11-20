import { describe, expect, it } from 'vitest';
import { SEED_APPS } from '@/lib/catalog';
import { cliCommand, navigationItemJson } from '@/lib/configSnippet';

const files = SEED_APPS.find((app) => app.slug === 'files');

describe('navigation snippet', () => {
  it('prints the NavigationItem for shellui.config.json', () => {
    expect(files).toBeTruthy();
    expect(navigationItemJson(files!)).toBe(`{
  "label": "Files",
  "path": "/files",
  "url": "https://files.shellui.com/",
  "icon": "folder"
}`);
  });

  it('prints the shellui add command', () => {
    expect(cliCommand('files')).toBe('shellui add files');
    expect(cliCommand('status-board')).toBe('shellui add status-board');
    expect(cliCommand('files; rm -rf /')).toBeNull();
    expect(cliCommand('../files')).toBeNull();
  });
});
