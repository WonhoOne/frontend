// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MockEmployeeInventoryDataSource,
  type EmployeeInventoryDataSource,
} from '@/features/employee-inventory';
import { mockHttpError } from '@/features/employee-tours/MockEmployeeTourDataSource';
import { BackendNetworkError } from '@/integrations/backend/client/backendHttpError';
import { EmployeeInventoryPage } from '@/pages/employee-inventory/EmployeeInventoryPage';

const holder = vi.hoisted((): { source: EmployeeInventoryDataSource | null } => ({ source: null }));

vi.mock('@/app/providers/employeeInventoryDataSource', () => ({
  get employeeInventoryDataSource() {
    return holder.source;
  },
}));

const seed = [
  { itemType: 'COUPLE_TSHIRT', quantity: 12 },
  { itemType: 'GINSENG_GIFT', quantity: 0 },
  { itemType: 'GOLF_BALL', quantity: 35 },
  { itemType: 'SCARF', quantity: 8 },
] as const;

function useSource() {
  const source = new MockEmployeeInventoryDataSource([...seed]);
  holder.source = source;
  return source;
}

function renderInventory() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } },
  });
  const router = createMemoryRouter(
    [{ path: '/employee/inventory', element: <EmployeeInventoryPage /> }],
    { initialEntries: ['/employee/inventory'] },
  );
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

async function openGolfDialog() {
  fireEvent.click(await screen.findByRole('button', { name: '골프공 재고 추가' }));
  return screen.findByRole('dialog', { name: '골프공 재고 추가' });
}

beforeEach(() => {
  useSource();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('E05 inventory', () => {
  it('shows the four fixed items with server quantities including zero, without editable cells', async () => {
    renderInventory();

    const table = await screen.findByRole('table', { name: '물품별 현재 재고' });
    expect(within(table).getByRole('row', { name: /커플 기념 티셔츠/ })).toHaveTextContent('12개');
    expect(within(table).getByRole('row', { name: /건강 인삼 기념품/ })).toHaveTextContent('0개');
    expect(within(table).getByRole('row', { name: /아웃도어 기념품 스카프/ })).toHaveTextContent(
      '8개',
    );
    expect(within(table).queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('adds a positive delta and shows the server total in the row and status line', async () => {
    const source = useSource();
    const add = vi.spyOn(source, 'addStock');
    renderInventory();
    const dialog = await openGolfDialog();

    expect(dialog).toHaveTextContent('현재 재고35개');
    fireEvent.change(within(dialog).getByLabelText(/추가할 수량/), { target: { value: '5' } });
    expect(dialog).toHaveTextContent('추가 후 재고40개');
    fireEvent.click(within(dialog).getByRole('button', { name: '추가' }));

    expect(await screen.findByText('골프공 재고를 5개 추가했습니다. 현재 40개')).toBeVisible();
    expect(add).toHaveBeenCalledWith('GOLF_BALL', 5);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('row', { name: /골프공/ })).toHaveTextContent('40개');
  });

  it('validates the quantity without sending a request', async () => {
    const source = useSource();
    const add = vi.spyOn(source, 'addStock');
    renderInventory();
    const dialog = await openGolfDialog();

    fireEvent.change(within(dialog).getByLabelText(/추가할 수량/), { target: { value: '0' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '추가' }));

    expect(await within(dialog).findByText('1개 이상 입력해 주세요.')).toBeVisible();
    expect(add).not.toHaveBeenCalled();
  });

  it('reports a server failure and keeps the dialog for another try', async () => {
    const source = useSource();
    vi.spyOn(source, 'addStock').mockRejectedValueOnce(mockHttpError(500, 'INTERNAL_ERROR'));
    renderInventory();
    const dialog = await openGolfDialog();

    fireEvent.change(within(dialog).getByLabelText(/추가할 수량/), { target: { value: '5' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '추가' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '재고를 추가하지 못했습니다.',
    );
    expect(within(dialog).getByRole('button', { name: '추가' })).toBeEnabled();
  });

  it('never resends on an unknown result: re-read first, then confirm explicitly', async () => {
    const source = useSource();
    const realAdd = source.addStock.bind(source);
    const add = vi.spyOn(source, 'addStock').mockImplementationOnce(async (itemType, quantity) => {
      // The write reached the server, but the response was lost.
      await realAdd(itemType, quantity);
      throw new BackendNetworkError();
    });
    renderInventory();
    const dialog = await openGolfDialog();

    fireEvent.change(within(dialog).getByLabelText(/추가할 수량/), { target: { value: '5' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '추가' }));

    const alert = await within(dialog).findByRole('alert');
    expect(alert).toHaveTextContent('추가가 반영되었는지 확인할 수 없습니다.');
    expect(alert).toHaveTextContent('시도 전 재고 35개, 추가하려던 수량 5개');
    expect(within(dialog).getByRole('button', { name: '다시 추가' })).toBeDisabled();
    expect(add).toHaveBeenCalledTimes(1);

    fireEvent.click(within(dialog).getByRole('button', { name: '현재 재고 다시 보기' }));
    expect(await within(dialog).findByText(/지금 재고 40개/)).toBeVisible();
    expect(within(dialog).getByText(/반영된 것으로 보입니다/)).toBeVisible();

    fireEvent.click(within(dialog).getByRole('button', { name: '다시 추가' }));
    expect(within(dialog).getByText(/한 번 더 더해질 수 있습니다/)).toBeVisible();
    expect(add).toHaveBeenCalledTimes(1);
  });
});
