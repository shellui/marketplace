import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/renderApp';

describe('app detail', () => {
  it('shows the description, permissions, and screenshot controls', async () => {
    const user = userEvent.setup();
    renderApp('/apps/files');

    expect(screen.getByRole('heading', { name: 'Files' })).toBeTruthy();
    expect(screen.getByText(/File calls go through @shellui\/sdk/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Permissions' })).toBeTruthy();
    expect(screen.getByText('Reads and writes files through storage-service.')).toBeTruthy();
    expect(screen.getByText('0.3.0')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Homepage' }).getAttribute('href')).toBe(
      'https://files.shellui.com/',
    );

    expect(screen.getByRole('img', { name: 'Files preview: a folder list' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next screenshot' }));
    expect(screen.getByRole('img', { name: 'Files preview: a share link' })).toBeTruthy();

    const gallery = screen.getByRole('region', { name: 'Screenshots' });
    gallery.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('img', { name: 'Files preview: a folder list' })).toBeTruthy();
  });

  it('says when the slug is missing', () => {
    renderApp('/apps/missing');
    expect(screen.getByRole('heading', { name: 'This app is not in the directory' })).toBeTruthy();
  });
});
