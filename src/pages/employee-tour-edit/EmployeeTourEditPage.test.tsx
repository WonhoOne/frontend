// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MockEmployeeTourDataSource,
  type EmployeeTourDataSource,
  type EmployeeTourProduct,
} from '@/features/employee-tours';
import { BackendNetworkError } from '@/integrations/backend/client/backendHttpError';
import { EmployeeTourEditPage } from '@/pages/employee-tour-edit/EmployeeTourEditPage';

const holder = vi.hoisted((): { source: EmployeeTourDataSource | null } => ({ source: null }));

vi.mock('@/app/providers/employeeTourDataSource', () => ({
  get employeeTourDataSource() {
    return holder.source;
  },
}));

const scheduledGolf: EmployeeTourProduct = {
  id: '3',
  theme: 'GOLF_CHALLENGE',
  name: 'F2 Synthetic Golf',
  description: 'Has a schedule',
  stylePrices: [
    { style: 'CLASSIC', amount: 250000 },
    { style: 'GRAND', amount: 400000 },
    { style: 'PREMIUM', amount: 650000 },
  ],
};

function useSource(source: MockEmployeeTourDataSource) {
  holder.source = source;
  return source;
}

function renderEdit(path = '/employee/tours/3/edit') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } },
  });
  const router = createMemoryRouter(
    [
      { path: '/employee/tours/:tourId/edit', element: <EmployeeTourEditPage /> },
      { path: '/employee/tours', element: <h1>List placeholder</h1> },
    ],
    { initialEntries: [path] },
  );

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { router, queryClient };
}

beforeEach(() => {
  useSource(new MockEmployeeTourDataSource([scheduledGolf], new Set(['3'])));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('E04 product edit', () => {
  it('loads a fresh copy into the form and keeps Save disabled until something changes', async () => {
    renderEdit();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'F2 Synthetic Golf' }),
    ).toBeVisible();
    expect(screen.getByText(/ID 3/)).toBeVisible();
    expect(screen.getByLabelText(/상품명/)).toHaveValue('F2 Synthetic Golf');
    expect(screen.getByLabelText(/Grand 1인 가격/)).toHaveValue('400000');
    expect(screen.getByText(/여행 일정이 있으면 테마를 바꿀 수 없습니다/)).toBeVisible();

    const save = screen.getByRole('button', { name: '저장' });
    expect(save).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/상품명/), { target: { value: 'F2 Golf Renamed' } });
    expect(save).toBeEnabled();

    fireEvent.change(screen.getByLabelText(/상품명/), { target: { value: ' F2 Synthetic Golf ' } });
    expect(save).toBeDisabled();
  });

  it('saves, stays on the page and shows the server values', async () => {
    const source = useSource(new MockEmployeeTourDataSource([scheduledGolf], new Set(['3'])));
    const updateSpy = vi.spyOn(source, 'updateTourProduct');
    const { router } = renderEdit();
    await screen.findByLabelText(/상품명/);

    fireEvent.change(screen.getByLabelText(/상품명/), { target: { value: ' F2 Golf Renamed ' } });
    fireEvent.change(screen.getByLabelText(/Premium 1인 가격/), { target: { value: '700,000' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('변경 사항을 저장했습니다.')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1, name: 'F2 Golf Renamed' })).toBeVisible();
    expect(screen.getByLabelText(/상품명/)).toHaveValue('F2 Golf Renamed');
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
    expect(router.state.location.pathname).toBe('/employee/tours/3/edit');
    expect(updateSpy).toHaveBeenCalledWith('3', {
      theme: 'GOLF_CHALLENGE',
      name: 'F2 Golf Renamed',
      description: 'Has a schedule',
      stylePrices: [
        { style: 'CLASSIC', amount: 250000 },
        { style: 'GRAND', amount: 400000 },
        { style: 'PREMIUM', amount: 700000 },
      ],
    });
  });

  it('keeps other edits on a 409 Theme lock and lets the Theme be reverted', async () => {
    renderEdit();
    await screen.findByLabelText(/상품명/);

    fireEvent.change(screen.getByLabelText(/상품명/), { target: { value: 'Keep this name' } });
    fireEvent.change(screen.getByLabelText(/테마/), { target: { value: 'OUTDOOR_TREKKING' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('테마를 바꿀 수 없습니다');
    await waitFor(() => expect(alert).toHaveFocus());
    expect(screen.getByLabelText(/상품명/)).toHaveValue('Keep this name');

    fireEvent.click(screen.getByRole('button', { name: '테마 되돌리기' }));
    expect(screen.getByLabelText(/테마/)).toHaveValue('GOLF_CHALLENGE');
    expect(screen.getByLabelText(/상품명/)).toHaveValue('Keep this name');

    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText('변경 사항을 저장했습니다.')).toBeVisible();
  });

  it('offers a direct re-send of the same body when the PUT result is unknown', async () => {
    const source = useSource(new MockEmployeeTourDataSource([scheduledGolf], new Set(['3'])));
    const updateSpy = vi
      .spyOn(source, 'updateTourProduct')
      .mockRejectedValueOnce(new BackendNetworkError());
    renderEdit();
    await screen.findByLabelText(/상품명/);

    fireEvent.change(screen.getByLabelText(/설명/), { target: { value: 'New description' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('저장 결과를 확인할 수 없습니다.')).toBeVisible();
    expect(updateSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '다시 저장' }));
    expect(await screen.findByText('변경 사항을 저장했습니다.')).toBeVisible();
    expect(updateSpy).toHaveBeenCalledTimes(2);
    expect(updateSpy.mock.calls[1]).toEqual(updateSpy.mock.calls[0]);
  });

  it.each(['/employee/tours/abc/edit', '/employee/tours/012/edit', '/employee/tours/99/edit'])(
    'shows not-found for %s',
    async (path) => {
      renderEdit(path);

      expect(
        await screen.findByRole('heading', { level: 1, name: '상품을 찾을 수 없습니다' }),
      ).toBeVisible();
      expect(screen.getByRole('link', { name: '여행상품 목록으로' })).toHaveAttribute(
        'href',
        '/employee/tours',
      );
    },
  );
});
