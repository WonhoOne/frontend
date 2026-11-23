// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { employeeInventoryQueryKey } from '@/features/employee-inventory';
import {
  MockEmployeeScheduleDataSource,
  type EmployeeSchedule,
  type EmployeeScheduleDataSource,
} from '@/features/employee-schedules';
import { mockHttpError } from '@/features/employee-tours/MockEmployeeTourDataSource';
import { BackendHttpError } from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError } from '@/integrations/backend/contracts';
import { EmployeeSchedulesPage } from '@/pages/employee-schedules/EmployeeSchedulesPage';

const holder = vi.hoisted((): { source: EmployeeScheduleDataSource | null } => ({ source: null }));

vi.mock('@/app/providers/employeeScheduleDataSource', () => ({
  get employeeScheduleDataSource() {
    return holder.source;
  },
}));

const trekking: EmployeeSchedule = {
  id: 5,
  tourId: 2,
  tourName: 'Synthetic Trekking',
  theme: 'OUTDOOR_TREKKING',
  startDate: '2026-12-19',
  endDate: '2026-12-21',
  participantCount: 3,
  confirmed: true,
  operationStatus: 'SCHEDULED',
};

const golf: EmployeeSchedule = {
  id: 6,
  tourId: 1,
  tourName: 'Synthetic Golf',
  theme: 'GOLF_CHALLENGE',
  startDate: '2026-12-26',
  endDate: '2026-12-28',
  participantCount: 1,
  confirmed: false,
  operationStatus: 'SCHEDULED',
};

function useSource(stock: Partial<Record<'SCARF' | 'GOLF_BALL', number>> = { SCARF: 20 }) {
  const source = new MockEmployeeScheduleDataSource([trekking, golf], stock);
  holder.source = source;
  return source;
}

function renderSchedules() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } },
  });
  const router = createMemoryRouter(
    [{ path: '/employee/schedules', element: <EmployeeSchedulesPage /> }],
    { initialEntries: ['/employee/schedules'] },
  );
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return queryClient;
}

function trekkingRow() {
  return screen.getByRole('row', { name: /Synthetic Trekking/ });
}

beforeEach(() => {
  useSource();
});

describe('Employee departures', () => {
  it('lists schedules with their operation state and only the allowed actions', async () => {
    renderSchedules();

    const table = await screen.findByRole('table', { name: '여행 일정별 운영 상태' });
    const row = within(table).getByRole('row', { name: /Synthetic Trekking/ });
    expect(row).toHaveTextContent('2026-12-19 – 2026-12-21');
    expect(row).toHaveTextContent('3명');
    expect(row).toHaveTextContent('확정');
    expect(row).toHaveTextContent('출발 전');
    expect(within(row).getByRole('button', { name: /출발 처리/ })).toBeEnabled();
    expect(within(row).getByRole('button', { name: /완료 처리/ })).toBeDisabled();

    const unconfirmed = within(table).getByRole('row', { name: /Synthetic Golf/ });
    expect(unconfirmed).toHaveTextContent('모집 중');
    expect(within(unconfirmed).getByRole('button', { name: /출발 처리/ })).toBeDisabled();
  });

  it('confirms, marks departed, shows the server deduction and refreshes inventory', async () => {
    const source = useSource();
    const depart = vi.spyOn(source, 'markDeparted');
    const queryClient = renderSchedules();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await screen.findByRole('table');
    fireEvent.click(within(trekkingRow()).getByRole('button', { name: /출발 처리/ }));
    const dialog = await screen.findByRole('dialog', { name: '출발 처리' });
    expect(dialog).toHaveTextContent('예상 차감아웃도어 기념품 스카프 3개');
    expect(depart).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: '출발 처리' }));

    expect(
      await screen.findByText(
        'Synthetic Trekking (2026-12-19) 출발 처리했습니다. 차감: 아웃도어 기념품 스카프 −3개, 남은 재고 17개',
      ),
    ).toBeVisible();
    expect(depart).toHaveBeenCalledWith(5);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: employeeInventoryQueryKey });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trekkingRow()).toHaveTextContent('여행 중'));
    expect(within(trekkingRow()).getByRole('button', { name: /완료 처리/ })).toBeEnabled();

    fireEvent.click(within(trekkingRow()).getByRole('button', { name: /완료 처리/ }));
    const completeDialog = await screen.findByRole('dialog', { name: '여행 완료 처리' });
    fireEvent.click(within(completeDialog).getByRole('button', { name: '완료 처리' }));

    expect(
      await screen.findByText('Synthetic Trekking (2026-12-19) 여행을 완료 처리했습니다.'),
    ).toBeVisible();
    await waitFor(() => expect(trekkingRow()).toHaveTextContent('완료'));
  });

  it('cancelling the confirm step sends nothing', async () => {
    const source = useSource();
    const depart = vi.spyOn(source, 'markDeparted');
    renderSchedules();

    await screen.findByRole('table');
    fireEvent.click(within(trekkingRow()).getByRole('button', { name: /출발 처리/ }));
    const dialog = await screen.findByRole('dialog', { name: '출발 처리' });
    fireEvent.click(within(dialog).getByRole('button', { name: '취소' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(depart).not.toHaveBeenCalled();
  });

  it('shows which item is short on INSUFFICIENT_INVENTORY and keeps the trip scheduled', async () => {
    const source = useSource();
    vi.spyOn(source, 'markDeparted').mockRejectedValueOnce(
      new BackendHttpError(
        { status: 409, statusText: 'Conflict', headers: { 'content-type': 'application/json' } },
        {
          code: 'INSUFFICIENT_INVENTORY',
          message: 'SCARF stock 2 is below the required 3.',
          fieldErrors: [],
        },
      ),
    );
    renderSchedules();

    await screen.findByRole('table');
    fireEvent.click(within(trekkingRow()).getByRole('button', { name: /출발 처리/ }));
    const dialog = await screen.findByRole('dialog', { name: '출발 처리' });
    fireEvent.click(within(dialog).getByRole('button', { name: '출발 처리' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '재고가 부족해 출발 처리하지 못했습니다. 재고는 바뀌지 않았습니다. SCARF stock 2 is below the required 3.',
    );
    // The modal hides the page from the accessibility tree while it is open.
    expect(screen.getByRole('row', { name: /Synthetic Trekking/, hidden: true })).toHaveTextContent(
      '출발 전',
    );
  });

  it('explains SCHEDULE_ALREADY_DEPARTED and reloads the list', async () => {
    const source = useSource();
    vi.spyOn(source, 'markDeparted').mockRejectedValueOnce(
      mockHttpError(409, 'SCHEDULE_ALREADY_DEPARTED'),
    );
    const list = vi.spyOn(source, 'listSchedules');
    renderSchedules();

    await screen.findByRole('table');
    fireEvent.click(within(trekkingRow()).getByRole('button', { name: /출발 처리/ }));
    const dialog = await screen.findByRole('dialog', { name: '출발 처리' });
    fireEvent.click(within(dialog).getByRole('button', { name: '출발 처리' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '이미 출발 처리된 일정입니다.',
    );
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
  });

  it('shows a contract-shape read failure with a retry', async () => {
    const source = useSource();
    vi.spyOn(source, 'listSchedules').mockRejectedValue(
      new ContractMappingError('EmployeeTourSchedule[]', '$', 'expected-array'),
    );
    renderSchedules();

    expect(await screen.findByText('데이터 형식이 올바르지 않습니다')).toBeVisible();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeVisible();
  });
});
