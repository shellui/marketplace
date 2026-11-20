import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/renderApp';

function directory() {
  return screen.getByRole('region', { name: 'Directory' });
}

describe('browse', () => {
  it('lists the local catalog and a local-catalog note', async () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Shellui Marketplace' })).toBeTruthy();
    expect(within(directory()).getByRole('heading', { name: 'Files' })).toBeTruthy();
    expect(within(directory()).getByRole('heading', { name: 'Notes' })).toBeTruthy();
    expect(await screen.findByText('Showing the local catalog.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Install' })).toBeNull();
    expect(document.body.textContent).not.toMatch(/app store/i);
    expect(document.body.textContent).not.toMatch(/checkout|pricing/i);
  });

  it('filters by search, category, and publisher', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByRole('searchbox', { name: 'Search apps' }), 'notes');
    expect(within(directory()).getByRole('heading', { name: 'Notes' })).toBeTruthy();
    expect(within(directory()).queryByRole('heading', { name: 'Files' })).toBeNull();

    await user.clear(screen.getByRole('searchbox', { name: 'Search apps' }));
    await user.click(
      within(screen.getByRole('group', { name: 'Category' })).getByRole('button', {
        name: 'Documentation',
      }),
    );
    expect(within(directory()).getByRole('heading', { name: 'Docs' })).toBeTruthy();
    expect(within(directory()).queryByRole('heading', { name: 'Files' })).toBeNull();

    await user.click(
      within(screen.getByRole('group', { name: 'Category' })).getByRole('button', { name: 'All' }),
    );
    await user.click(
      within(screen.getByRole('group', { name: 'Publisher' })).getByRole('button', {
        name: 'Official',
      }),
    );
    expect(within(directory()).getByRole('heading', { name: 'Files' })).toBeTruthy();
    expect(within(directory()).queryByRole('heading', { name: 'Notes' })).toBeNull();

    await user.click(
      within(screen.getByRole('group', { name: 'Publisher' })).getByRole('button', {
        name: 'Community',
      }),
    );
    expect(within(directory()).getByRole('heading', { name: 'Notes' })).toBeTruthy();
    expect(within(directory()).getByRole('heading', { name: 'Status Board' })).toBeTruthy();
    expect(within(directory()).queryByRole('heading', { name: 'Admin' })).toBeNull();
  });

  it('sorts the directory by name', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort' }), 'name');
    const headings = within(directory()).getAllByRole('heading');
    expect(headings[0]?.textContent).toBe('Admin');
    expect(headings.map((heading) => heading.textContent)).toContain('AI Assistant');
  });
});
