// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MockEmployeeTourDataSource,
  type EmployeeTourDataSource,
  type EmployeeTourProduct,
} from '@/features/employee-tours';
import { mockHttpError } from '@/features/employee-tours/MockEmployeeTourDataSource';
import { BackendNetworkError } from '@/integrations/backend/client/backendHttpError';
import { EmployeeTourCreatePage } from '@/pages/employee-tour-create/EmployeeTourCreatePage';
import { EmployeeToursPage } from '@/pages/employee-tours/EmployeeToursPage';

const holder = vi.hoisted((): { source: EmployeeTourDataSource | null } => ({ source: null }));

vi.mock('@/app/providers/employeeTourDataSource', () => ({
  get employeeTourDataSource() {
    return holder.source;
  },
}));

const golf: EmployeeTourProduct = {
  id: '3',
  theme: 'GOLF_CHALLENGE',
  name: 'F2 Synthetic Golf',
  description: 'Synthetic',
  stylePrices: [
    { style: 'CLASSIC', amount: 250000 },
    { style: 'GRAND', amount: 400000 },
    { style: 'PREMIUM', amount: 650000 },
  ],
};

function useSource(source: EmployeeTourDataSource) {
  holder.source = source;
  return source;
}

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } },
  });
  const router = createMemoryRouter(
    [
      { path: '/employee/tours', element: <EmployeeToursPage /> },
      { path: '/employee/tours/new', element: <EmployeeTourCreatePage /> },
      { path: '/employee/tours/:tourId/edit', element: <h1>Edit placeholder</h1> },
      { path: '/employee/login', element: <h1>Login placeholder</h1> },
    ],
    { initialEntries: [path] },
  );

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

function fillGolfForm() {
  fireEvent.change(screen.getByLabelText(/테마/), { target: { value: 'GOLF_CHALLENGE' } });
  fireEvent.change(screen.getByLabelText(/상품명/), { target: { value: ' 제주 골프 3일 ' } });
  fireEvent.change(screen.getByLabelText(/설명/), { target: { value: '바다 골프' } });
  fireEvent.change(screen.getByLabelText(/Classic 1인 가격/), { target: { value: '890,000' } });
  fireEvent.change(screen.getByLabelText(/Grand 1인 가격/), { target: { value: '1200000' } });
  fireEvent.change(screen.getByLabelText(/Premium 1인 가격/), { target: { value: '1800000' } });
}

beforeEach(() => {
  useSource(new MockEmployeeTourDataSource([golf]));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('E02 product list', () => {
  it('renders products in Backend order with Theme title, ID and formatted style prices', async () => {
    renderAt('/employee/tours');

    const table = await screen.findByRole('table', { name: '여행상품 목록' });
    const row = within(table).getByRole('row', { name: /F2 Synthetic Golf/ });

    expect(within(row).getByRole('link', { name: 'F2 Synthetic Golf' })).toHaveAttribute(
      'href',
      '/employee/tours/3/edit',
    );
    expect(row).toHaveTextContent('ID 3');
    expect(row).toHaveTextContent('Golf Challenge');
    expect(row).toHaveTextContent('Classic₩250,000');
    expect(row).toHaveTextContent('Premium₩650,000');
    expect(screen.getByText('총 1개')).toBeInTheDocument();
  });

  it('shows the empty state with a create action', async () => {
    useSource(new MockEmployeeTourDataSource([]));
    renderAt('/employee/tours');

    expect(await screen.findByText('아직 여행상품이 없습니다')).toBeVisible();
    expect(screen.getAllByRole('link', { name: '+ 새 여행상품' })).toHaveLength(2);
  });

  it('shows a retryable error when the first load fails', async () => {
    const source = useSource(new MockEmployeeTourDataSource([golf]));
    const list = vi
      .spyOn(source, 'listTourProducts')
      // 5xx is retried once automatically (CP5 §2), so fail both attempts.
      .mockRejectedValueOnce(mockHttpError(500, 'INTERNAL_ERROR'))
      .mockRejectedValueOnce(mockHttpError(500, 'INTERNAL_ERROR'));
    renderAt('/employee/tours');

    expect(
      await screen.findByText('여행상품을 불러오지 못했습니다', {}, { timeout: 4000 }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByRole('link', { name: 'F2 Synthetic Golf' })).toBeVisible();
    expect(list).toHaveBeenCalledTimes(3);
  });

  it('shows the permission state on 403', async () => {
    const source = useSource(new MockEmployeeTourDataSource([golf]));
    vi.spyOn(source, 'listTourProducts').mockRejectedValue(mockHttpError(403, 'FORBIDDEN'));
    renderAt('/employee/tours');

    expect(await screen.findByText('이 작업을 할 권한이 없습니다.')).toBeVisible();
  });
});

describe('E03 product create', () => {
  it('shows exactly the price fields the selected Theme allows and keeps hidden values', async () => {
    renderAt('/employee/tours/new');

    expect(
      await screen.findByText(
        '테마를 선택하면 해당 테마에서 판매할 스타일의 가격을 입력할 수 있습니다.',
      ),
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText(/테마/), { target: { value: 'GOLF_CHALLENGE' } });
    fireEvent.change(screen.getByLabelText(/Classic 1인 가격/), { target: { value: '890000' } });
    expect(screen.getByText('₩890,000')).toBeVisible();

    fireEvent.change(screen.getByLabelText(/테마/), { target: { value: 'HONEYMOON_ROMANCE' } });
    expect(screen.queryByLabelText(/Classic 1인 가격/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Grand 1인 가격/)).toBeVisible();

    fireEvent.change(screen.getByLabelText(/테마/), { target: { value: 'GOLF_CHALLENGE' } });
    expect(screen.getByLabelText(/Classic 1인 가격/)).toHaveValue('890000');
  });

  it('blocks an incomplete submit with a focused error summary and no request', async () => {
    const source = useSource(new MockEmployeeTourDataSource([golf]));
    const create = vi.spyOn(source, 'createTourProduct');
    renderAt('/employee/tours/new');

    fireEvent.click(await screen.findByRole('button', { name: '저장' }));

    const summary = await screen.findByRole('alert');
    expect(summary).toHaveTextContent('입력 내용을 확인해 주세요 (3개 항목)');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a product and returns to the list with a status line and highlighted row', async () => {
    const source = useSource(new MockEmployeeTourDataSource([golf]));
    const create = vi.spyOn(source, 'createTourProduct');
    const router = renderAt('/employee/tours/new');
    await screen.findByLabelText(/테마/);

    fillGolfForm();
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('‘제주 골프 3일’ 여행상품을 만들었습니다.')).toBeVisible();
    expect(router.state.location.pathname).toBe('/employee/tours');
    expect(create).toHaveBeenCalledWith({
      theme: 'GOLF_CHALLENGE',
      name: '제주 골프 3일',
      description: '바다 골프',
      stylePrices: [
        { style: 'CLASSIC', amount: 890000 },
        { style: 'GRAND', amount: 1200000 },
        { style: 'PREMIUM', amount: 1800000 },
      ],
    });
    expect(await screen.findByRole('link', { name: '제주 골프 3일' })).toBeVisible();
  });

  it('maps Backend 422 field errors onto the submitted style field', async () => {
    const source = useSource(new MockEmployeeTourDataSource([golf]));
    vi.spyOn(source, 'createTourProduct').mockRejectedValue(
      mockHttpError(422, 'VALIDATION_FAILED', [
        { field: 'stylePrices[1].amount', code: 'OUT_OF_RANGE' },
      ]),
    );
    renderAt('/employee/tours/new');
    await screen.findByLabelText(/테마/);

    fillGolfForm();
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('허용 범위를 벗어났습니다.');
    expect(screen.getByLabelText(/Grand 1인 가격/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('never resends automatically when the result is unknown', async () => {
    const source = useSource(new MockEmployeeTourDataSource([golf]));
    const create = vi
      .spyOn(source, 'createTourProduct')
      .mockRejectedValue(new BackendNetworkError());
    renderAt('/employee/tours/new');
    await screen.findByLabelText(/테마/);

    fillGolfForm();
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(
      await screen.findByText('저장 결과를 확인할 수 없습니다. 이미 만들어졌을 수 있습니다.'),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: '그래도 다시 저장' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '저장 여부 확인' }));
    expect(await screen.findByText(/같은 테마·이름의 상품을 찾지 못했습니다/)).toBeVisible();
    expect(screen.getByRole('button', { name: '그래도 다시 저장' })).toBeEnabled();
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('asks before leaving with unsaved input and keeps values on stay', async () => {
    renderAt('/employee/tours/new');
    fireEvent.change(await screen.findByLabelText(/상품명/), { target: { value: '작성 중' } });

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(await screen.findByText('저장하지 않은 변경 사항이 있습니다')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: '계속 편집' }));
    await waitFor(() =>
      expect(screen.queryByText('저장하지 않은 변경 사항이 있습니다')).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText(/상품명/)).toHaveValue('작성 중');
  });
});
