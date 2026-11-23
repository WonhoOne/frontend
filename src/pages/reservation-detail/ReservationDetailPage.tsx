import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router';

import { reservationDataSource } from '@/app/providers/reservationDataSource';
import { routePaths } from '@/app/router/paths';
import {
  isReservationModifiable,
  localIsoDate,
  ReservationDataSourceError,
  ReservationEditDialog,
  reservationOptionLabel,
  reservationQueryKeys,
  reservationStyleLabel,
  useReservationDetail,
  type ReservationDataSource,
} from '@/features/reservation';
import { parseBackendResourceIdentity } from '@/shared/lib/resourceIdentity';
import { Button, PageContainer, Skeleton, TextLink } from '@/shared/ui';
import styles from '@/pages/reservation-detail/ReservationDetailPage.module.css';

function formatKrw(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

interface ReservationDetailPageProps {
  dataSource?: Pick<ReservationDataSource, 'getReservation'>;
  editDataSource?: Pick<ReservationDataSource, 'updateReservationConfiguration'>;
  /** 테스트용 오늘 날짜 (`YYYY-MM-DD`). 기본값은 브라우저 현지 날짜다. */
  today?: string;
}

/**
 * S07 Reservation Detail. Success와 같은 비공개 조회를 쓰지만, 다시 방문하는 화면이라
 * "방금 완료" 문구 없이 예약 정보만 보여준다. 401/403/404 처리 원칙은 Success와 같다.
 */
export function ReservationDetailPage({
  dataSource = reservationDataSource,
  editDataSource = reservationDataSource,
  today = localIsoDate(),
}: ReservationDetailPageProps = {}) {
  const { reservationId } = useParams();
  const parsedId = parseBackendResourceIdentity(reservationId);
  const query = useReservationDetail(dataSource, parsedId);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [editClosed, setEditClosed] = useState(false);
  const privateError =
    query.error instanceof ReservationDataSourceError ? query.error.detail : null;

  if (parsedId === null || privateError?.kind === 'not-found')
    return (
      <PageContainer variant="reading">
        <section className={styles.message}>
          <h1>Reservation not found</h1>
          <p>This reservation is unavailable or cannot be shown.</p>
          <TextLink to={routePaths.tours}>Browse tours</TextLink>
        </section>
      </PageContainer>
    );
  if (query.data === undefined && query.isPending)
    return (
      <PageContainer variant="transaction">
        <section className={styles.page} aria-busy="true" aria-label="Loading reservation details">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </section>
      </PageContainer>
    );

  if (privateError?.kind === 'authentication-required')
    return (
      <PageContainer variant="reading">
        <section className={styles.message}>
          <h1>Sign in to view this reservation</h1>
          <p>Your reservation details are private. Sign in, then open this reservation again.</p>
          <TextLink to={routePaths.login}>Go to Login</TextLink>
        </section>
      </PageContainer>
    );

  if (privateError?.kind === 'forbidden')
    return (
      <PageContainer variant="reading">
        <section className={styles.message}>
          <h1>Reservation unavailable</h1>
          <p>This account cannot view this private reservation.</p>
          <TextLink to={routePaths.tours}>Browse tours</TextLink>
        </section>
      </PageContainer>
    );

  const reservation = query.data;
  if (reservation === undefined)
    return (
      <PageContainer variant="reading">
        <section className={styles.message}>
          <h1>We could not load this reservation</h1>
          <p>The private reservation snapshot could not be retrieved right now.</p>
          <TextLink to={routePaths.tours}>Browse tours</TextLink>
        </section>
      </PageContainer>
    );

  const stale = query.isFetching || query.isError;
  const modifiable = !editClosed && isReservationModifiable(reservation.schedule.startDate, today);
  return (
    <PageContainer variant="transaction">
      <article className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Reservation #{reservation.id}</p>
          <h1>{reservation.tourProduct.name}</h1>
          <p>
            Your reservation snapshot reflects the configuration and price returned by the service.
          </p>
          {modifiable ? (
            <div>
              <Button
                onClick={() => {
                  setEditStatus(null);
                  setEditing(true);
                }}
                variant="secondary"
              >
                Edit trip
              </Button>
            </div>
          ) : (
            <p className={styles.eyebrow}>
              Changes are closed for this trip because its departure date has arrived.
            </p>
          )}
        </header>
        <div aria-live="polite" className={styles.statusRegion} role="status">
          {editStatus === null ? null : <p className={styles.success}>{editStatus}</p>}
        </div>
        {stale ? (
          <p role="status" className={styles.notice}>
            Showing the last confirmed reservation snapshot while the latest refresh is unavailable.
          </p>
        ) : null}
        <section className={styles.section} aria-labelledby="detail-trip">
          <h2 id="detail-trip">Trip</h2>
          <dl className={styles.summary}>
            <div>
              <dt>Dates</dt>
              <dd>
                {reservation.schedule.startDate} – {reservation.schedule.endDate}
              </dd>
            </div>
            <div>
              <dt>Travellers</dt>
              <dd>{reservation.participantCount}</dd>
            </div>
            <div>
              <dt>Style</dt>
              <dd>{reservationStyleLabel(reservation.configuration.style)}</dd>
            </div>
          </dl>
        </section>
        <section className={styles.section} aria-labelledby="detail-config">
          <h2 id="detail-config">Configuration snapshot</h2>
          <dl className={styles.summary}>
            <div>
              <dt>Hotel</dt>
              <dd>{reservationOptionLabel(reservation.configuration.hotelOption)}</dd>
            </div>
            <div>
              <dt>Transport</dt>
              <dd>{reservationOptionLabel(reservation.configuration.transportOption)}</dd>
            </div>
            <div>
              <dt>Meal</dt>
              <dd>{reservationOptionLabel(reservation.configuration.mealOption)}</dd>
            </div>
            <div>
              <dt>Extras</dt>
              <dd>
                {reservation.configuration.extraOptions.map(reservationOptionLabel).join(', ') ||
                  'None'}
              </dd>
            </div>
          </dl>
        </section>
        <section className={styles.section} aria-labelledby="detail-price">
          <h2 id="detail-price">Price snapshot</h2>
          <dl className={styles.summary}>
            <div>
              <dt>Unit price</dt>
              <dd>{formatKrw(reservation.price.unitPrice)}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatKrw(reservation.price.subtotal)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>{formatKrw(reservation.price.discount?.amount ?? 0)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{formatKrw(reservation.price.total)}</dd>
            </div>
          </dl>
        </section>
        <section className={styles.section} aria-labelledby="detail-recruitment">
          <h2 id="detail-recruitment">Schedule recruitment</h2>
          <p>
            {reservation.schedule.recruitment.confirmed
              ? 'The schedule recruitment requirement has been met.'
              : `${reservation.schedule.recruitment.currentCount} of ${reservation.schedule.recruitment.requiredCount} recruitment units are currently filled.`}
          </p>
        </section>
        <TextLink to={routePaths.tours}>Browse tours</TextLink>
      </article>
      <ReservationEditDialog
        dataSource={editDataSource}
        onClose={() => setEditing(false)}
        onNeedsRefresh={() => {
          void queryClient.invalidateQueries({
            queryKey: reservationQueryKeys.detail(reservation.id),
          });
        }}
        onClosedForChanges={() => setEditClosed(true)}
        onUpdated={(updated) => {
          setEditing(false);
          setEditStatus(
            `Trip updated. The service recalculated the total to ${formatKrw(updated.price.total)}.`,
          );
        }}
        open={editing}
        reservation={reservation}
      />
    </PageContainer>
  );
}
