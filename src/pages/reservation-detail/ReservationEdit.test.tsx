// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import type {
  ReservationConfigurationModel,
  ReservationModel,
} from '@/features/reservation/reservation.model';
import { ReservationDetailPage } from '@/pages/reservation-detail/ReservationDetailPage';

const reservation: ReservationModel = {
  id: 801,
  participantCount: 3,
  tourProduct: { id: 2, theme: 'OUTDOOR_TREKKING', name: 'Synthetic Trekking' },
  schedule: {
    id: 5,
    startDate: '2026-12-19',
    endDate: '2026-12-21',
    recruitment: { unit: 'PARTICIPANT', currentCount: 3, requiredCount: 3, confirmed: true },
  },
  configuration: {
    style: 'CLASSIC',
    hotelOption: 'HOTEL_3_STAR',
    transportOption: 'PREMIUM_VAN_10',
    mealOption: 'LUNCH_BOX',
    extraOptions: [],
  },
  price: {
    unitPrice: 1_200_000,
    subtotal: 3_600_000,
    discount: null,
    total: 3_600_000,
    currency: 'KRW',
  },
};

type Update = (
  id: number,
  configuration: ReservationConfigurationModel,
) => Promise<ReservationModel>;

function renderDetail(
  updateReservationConfiguration: Update,
  options: { today?: string; reservation?: ReservationModel } = {},
) {
  const getReservation = vi.fn().mockResolvedValue(options.reservation ?? reservation);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/reservations/801']}>
        <Routes>
          <Route
            element={
              <ReservationDetailPage
                dataSource={{ getReservation }}
                editDataSource={{ updateReservationConfiguration }}
                today={options.today ?? '2026-11-23'}
              />
            }
            path="/reservations/:reservationId"
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return { getReservation };
}

async function openEdit() {
  fireEvent.click(await screen.findByRole('button', { name: 'Edit trip' }));
  return screen.findByRole('dialog', { name: 'Edit trip' });
}

describe('Reservation detail: edit trip', () => {
  it('changes the style to Grand and adds coffee and champagne, then shows the server price', async () => {
    const update = vi.fn<Update>((_id, configuration) =>
      Promise.resolve({
        ...reservation,
        configuration,
        price: {
          ...reservation.price,
          unitPrice: 1_800_000,
          subtotal: 5_400_000,
          total: 5_400_000,
        },
      }),
    );
    renderDetail(update);
    const dialog = await openEdit();

    expect(within(dialog).getByText('3 (cannot be changed)')).toBeVisible();
    const save = within(dialog).getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();

    fireEvent.click(within(dialog).getByRole('radio', { name: 'Grand' }));
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Coffee' }));
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Champagne' }));
    fireEvent.click(save);

    expect(await screen.findByText(/Trip updated\. .*5,400,000/)).toBeVisible();
    expect(update).toHaveBeenCalledWith(801, {
      style: 'GRAND',
      hotelOption: 'HOTEL_3_STAR',
      transportOption: 'PREMIUM_VAN_10',
      mealOption: 'LUNCH_BOX',
      extraOptions: ['COFFEE', 'CHAMPAGNE'],
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Grand')).toBeVisible();
    expect(screen.getByText('Coffee, Champagne')).toBeVisible();
  });

  it('offers only the theme styles and blocks a transport that cannot seat everyone', async () => {
    renderDetail(vi.fn<Update>(), {
      reservation: {
        ...reservation,
        tourProduct: { ...reservation.tourProduct, theme: 'HONEYMOON_ROMANCE' },
        configuration: { ...reservation.configuration, style: 'GRAND' },
      },
    });
    const dialog = await openEdit();

    expect(within(dialog).queryByRole('radio', { name: 'Classic' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('radio', { name: 'Premium' })).toBeEnabled();
    expect(within(dialog).getByRole('radio', { name: /Private luxury car/ })).toBeDisabled();
    expect(within(dialog).getByText(/seats 2, not enough for 3 travellers/)).toBeVisible();
  });

  it('explains 409 RESERVATION_NOT_MODIFIABLE and closes editing', async () => {
    const update = vi.fn<Update>().mockRejectedValue(
      new ReservationDataSourceError({
        kind: 'conflict',
        code: 'RESERVATION_NOT_MODIFIABLE',
        fieldErrors: [],
      }),
    );
    const { getReservation } = renderDetail(update);
    const dialog = await openEdit();

    fireEvent.click(within(dialog).getByRole('radio', { name: 'Grand' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'This trip can no longer be changed.',
    );
    expect(within(dialog).getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await waitFor(() => expect(getReservation).toHaveBeenCalledTimes(2));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Edit trip' })).not.toBeInTheDocument();
  });

  it('shows 422 field errors next to the choices', async () => {
    const update = vi.fn<Update>().mockRejectedValue(
      new ReservationDataSourceError({
        kind: 'validation',
        code: 'VALIDATION_FAILED',
        fieldErrors: [{ field: 'configuration.style', code: 'NOT_ALLOWED' }],
      }),
    );
    renderDetail(update);
    const dialog = await openEdit();

    fireEvent.click(within(dialog).getByRole('radio', { name: 'Premium' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Some selections were not accepted.',
    );
    expect(within(dialog).getByText('This style is not offered for this tour.')).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'Save changes' })).toBeEnabled();
  });

  it('hides the edit action once the departure date has arrived', async () => {
    renderDetail(vi.fn<Update>(), { today: '2026-12-19' });

    expect(await screen.findByRole('heading', { name: 'Synthetic Trekking' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Edit trip' })).not.toBeInTheDocument();
    expect(screen.getByText(/Changes are closed for this trip/)).toBeVisible();
  });
});
