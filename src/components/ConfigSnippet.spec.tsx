import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '@/test/renderApp';

describe('copy config JSON', () => {
  it('copies the navigation item and the CLI command', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    renderApp('/apps/files');

    expect(screen.getByText(/"path": "\/files"/)).toBeTruthy();
    expect(screen.getByText(/"icon": "folder"/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Copy config JSON' }));
    expect(writeText).toHaveBeenCalledWith(`{
  "label": "Files",
  "path": "/files",
  "url": "https://files.shellui.com/",
  "icon": "folder"
}`);

    await user.click(screen.getByRole('tab', { name: 'CLI' }));
    expect(screen.getByText('shellui add files')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Copy CLI command' }));
    expect(writeText).toHaveBeenCalledWith('shellui add files');
  });
});
