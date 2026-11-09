// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { createMemoryRouter, Link, RouterProvider, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';

function Editor() {
  const [dirty, setDirty] = useState(false);
  const guard = useUnsavedChangesGuard(dirty);
  const navigate = useNavigate();

  return (
    <div>
      <h1>Editor</h1>
      <button onClick={() => setDirty(true)}>Type</button>
      <Link to="/list">Leave by link</Link>
      <button
        onClick={() => {
          guard.allowNextNavigation();
          void navigate('/list');
        }}
      >
        Save and go
      </button>
      {guard.isBlocked ? (
        <div role="dialog">
          <button onClick={guard.stay}>Stay</button>
          <button onClick={guard.leave}>Leave</button>
        </div>
      ) : null}
    </div>
  );
}

function renderEditor() {
  const router = createMemoryRouter(
    [
      { path: '/edit', element: <Editor /> },
      { path: '/list', element: <h1>List</h1> },
    ],
    { initialEntries: ['/edit'] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('useUnsavedChangesGuard', () => {
  it('lets a clean form leave without asking', async () => {
    renderEditor();
    fireEvent.click(screen.getByRole('link', { name: 'Leave by link' }));
    expect(await screen.findByRole('heading', { name: 'List' })).toBeVisible();
  });

  it('asks before leaving a dirty form and can stay', async () => {
    renderEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Type' }));
    fireEvent.click(screen.getByRole('link', { name: 'Leave by link' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Stay' }));

    expect(screen.getByRole('heading', { name: 'Editor' })).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks before leaving a dirty form and can leave', async () => {
    renderEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Type' }));
    fireEvent.click(screen.getByRole('link', { name: 'Leave by link' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Leave' }));

    expect(await screen.findByRole('heading', { name: 'List' })).toBeVisible();
  });

  it('does not block the page’s own navigation after a save', async () => {
    renderEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Type' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save and go' }));

    expect(await screen.findByRole('heading', { name: 'List' })).toBeVisible();
  });
});
