// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';
import { Dialog } from '@/shared/ui/Dialog/Dialog';

afterEach(cleanup);

describe('Dialog', () => {
  it('renders accessible modal semantics with title, description, and close control', () => {
    render(
      <Dialog
        closeLabel="Close dialog"
        description="Dialog description"
        onOpenChange={vi.fn()}
        open
        title="Dialog title"
      >
        Dialog content
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Dialog title' });

    expect(dialog).toHaveAccessibleDescription('Dialog description');
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeVisible();
    expect(screen.getByText('Dialog content')).toBeVisible();
  });

  it('requests close from the explicit close control', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog closeLabel="Close dialog" onOpenChange={onOpenChange} open title="Dialog title">
        Dialog content
      </Dialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes on Escape by default', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog closeLabel="Close dialog" onOpenChange={onOpenChange} open title="Dialog title">
        Dialog content
      </Dialog>,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('can keep a critical dialog open on Escape', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog
        closeLabel="Close dialog"
        closeOnEscape={false}
        onOpenChange={onOpenChange}
        open
        title="Dialog title"
      >
        Dialog content
      </Dialog>,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('BottomSheet', () => {
  it('uses dialog semantics and always provides an explicit close control', () => {
    render(
      <BottomSheet
        closeLabel="Close sheet"
        description="Sheet description"
        onOpenChange={vi.fn()}
        open
        title="Sheet title"
      >
        Sheet content
      </BottomSheet>,
    );

    const sheet = screen.getByRole('dialog', { name: 'Sheet title' });

    expect(sheet).toHaveAccessibleDescription('Sheet description');
    expect(screen.getByRole('button', { name: 'Close sheet' })).toBeVisible();
    expect(screen.getByText('Sheet content')).toBeVisible();
  });

  it('requests close on Escape by default', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <BottomSheet closeLabel="Close sheet" onOpenChange={onOpenChange} open title="Sheet title">
        Sheet content
      </BottomSheet>,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('can keep a critical sheet open on Escape', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <BottomSheet
        closeLabel="Close sheet"
        closeOnEscape={false}
        onOpenChange={onOpenChange}
        open
        title="Sheet title"
      >
        Sheet content
      </BottomSheet>,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
