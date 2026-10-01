import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { routePaths } from '@/app/router/paths';
import { lookupReservation, mockReservationDataSource, visibleReservationFromLookup, type ReservationLookupState } from '@/features/reservation';
import { PageContainer, Skeleton, TextLink } from '@/shared/ui';
import styles from '@/pages/reservation-detail/ReservationDetailPage.module.css';

function formatKrw(value: number) { return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value); }

export function ReservationDetailPage() {
  const { reservationId } = useParams();
  const parsedId = Number(reservationId);
  const [state, setState] = useState<ReservationLookupState>({ status: 'loading' });

  useEffect(() => {
    if (!Number.isSafeInteger(parsedId) || parsedId <= 0) { setState({ status: 'not-found' }); return; }
    let active = true;
    const previous = visibleReservationFromLookup(state);
    void lookupReservation(mockReservationDataSource, parsedId, previous).then((next) => { if (active) setState(next); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedId]);

  if (state.status === 'loading') return <PageContainer variant="transaction"><section className={styles.page} aria-busy="true" aria-label="Loading reservation details"><Skeleton /><Skeleton /><Skeleton /></section></PageContainer>;
  if (state.status === 'not-found') return <PageContainer variant="reading"><section className={styles.message}><h1>Reservation not found</h1><p>This reservation is unavailable or cannot be shown.</p><TextLink to={routePaths.tours}>Browse tours</TextLink></section></PageContainer>;

  const reservation = visibleReservationFromLookup(state);
  if (reservation === null) return <PageContainer variant="reading"><section className={styles.message}><h1>We could not load this reservation</h1><p>The private reservation snapshot could not be retrieved right now.</p><TextLink to={routePaths.tours}>Browse tours</TextLink></section></PageContainer>;

  const stale = state.status === 'refreshing' || state.status === 'network-error' || state.status === 'server-error';
  return <PageContainer variant="transaction"><article className={styles.page}>
    <header className={styles.hero}><p className={styles.eyebrow}>Reservation #{reservation.id}</p><h1>{reservation.tourProduct.name}</h1><p>Your reservation snapshot reflects the configuration and price returned by the service.</p></header>
    {stale ? <p role="status" className={styles.notice}>Showing the last confirmed reservation snapshot while the latest refresh is unavailable.</p> : null}
    <section className={styles.section} aria-labelledby="detail-trip"><h2 id="detail-trip">Trip</h2><dl className={styles.summary}><div><dt>Dates</dt><dd>{reservation.schedule.startDate} – {reservation.schedule.endDate}</dd></div><div><dt>Travellers</dt><dd>{reservation.participantCount}</dd></div><div><dt>Style</dt><dd>{reservation.configuration.style}</dd></div></dl></section>
    <section className={styles.section} aria-labelledby="detail-config"><h2 id="detail-config">Configuration snapshot</h2><dl className={styles.summary}><div><dt>Hotel</dt><dd>{reservation.configuration.hotelOption}</dd></div><div><dt>Transport</dt><dd>{reservation.configuration.transportOption}</dd></div><div><dt>Meal</dt><dd>{reservation.configuration.mealOption}</dd></div><div><dt>Extras</dt><dd>{reservation.configuration.extraOptions.join(', ') || 'None'}</dd></div></dl></section>
    <section className={styles.section} aria-labelledby="detail-price"><h2 id="detail-price">Price snapshot</h2><dl className={styles.summary}><div><dt>Unit price</dt><dd>{formatKrw(reservation.price.unitPrice)}</dd></div><div><dt>Subtotal</dt><dd>{formatKrw(reservation.price.subtotal)}</dd></div><div><dt>Discount</dt><dd>{formatKrw(reservation.price.discount?.amount ?? 0)}</dd></div><div><dt>Total</dt><dd>{formatKrw(reservation.price.total)}</dd></div></dl></section>
    <section className={styles.section} aria-labelledby="detail-recruitment"><h2 id="detail-recruitment">Schedule recruitment</h2><p>{reservation.schedule.recruitment.confirmed ? 'The schedule recruitment requirement has been met.' : `${reservation.schedule.recruitment.currentCount} of ${reservation.schedule.recruitment.requiredCount} recruitment units are currently filled.`}</p></section>
    <TextLink to={routePaths.tours}>Browse tours</TextLink>
  </article></PageContainer>;
}
