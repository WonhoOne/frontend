import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { routePaths } from '@/app/router/paths';
 import { travelHistoryDataSource } from '@/app/providers/travelHistoryDataSource';
import { saveReturnContext, useAuth } from '@/features/auth';
import {
  isBrowserOffline,
  type TravelHistoryDataSource,
  useTravelHistory,
} from '@/features/travel-history';
import { Button, PageContainer, Skeleton } from '@/shared/ui';

import styles from '@/pages/my-trips/MyTripsPage.module.css';

function formatDateRange(startDate: string, endDate: string) {
  return `${startDate} – ${endDate}`;
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MyTripsPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.state.status !== 'unauthenticated') {
      return;
    }

    saveReturnContext({
      createdAt: Date.now(),
      intent: 'continue-navigation',
      returnTo: routePaths.myTrips,
    });
    void navigate(routePaths.login, { replace: true });
  }, [auth.state.status, navigate]);

  if (auth.state.status !== 'authenticated') {
    return (
      <div className={styles.page}>
        <PageContainer>
          <section aria-busy={auth.state.status === 'checking'} className={styles.state}>
            <p>
              {auth.state.status === 'checking'
                ? '로그인 상태를 확인하고 있습니다.'
                : '로그인 화면으로 이동하고 있습니다.'}
            </p>
          </section>
        </PageContainer>
      </div>
    );
  }

  return <AuthenticatedMyTrips dataSource={travelHistoryDataSource} />;
}

export function AuthenticatedMyTrips({ dataSource }: { dataSource: TravelHistoryDataSource }) {
  const navigate = useNavigate();
  const history = useTravelHistory(dataSource);

  const trips = history.data ?? [];

  return (
    <div className={styles.page}>
      <PageContainer>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h1>My Trips</h1>
          <p>완료된 여행 기록을 최근 순서대로 확인하세요.</p>
        </header>

        {history.isPending ? (
          <section aria-busy="true" aria-label="여행 기록 불러오는 중" className={styles.list}>
            {[0, 1, 2].map((index) => (
              <div className={styles.skeletonCard} key={index}>
                <Skeleton className={styles.skeletonTitle} variant="line" />
                <Skeleton className={styles.skeletonLine} variant="line" />
                <Skeleton className={styles.skeletonLine} variant="line" />
              </div>
            ))}
          </section>
        ) : null}

        {history.isError && history.data === undefined ? (
          <section className={styles.state}>
            <p role="alert">여행 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
            <Button onClick={() => void history.refetch()} variant="secondary">
              다시 시도
            </Button>
          </section>
        ) : null}

        {!history.isPending && !history.isError && trips.length === 0 ? (
          <section className={styles.state}>
            <h2>아직 지난 여행이 없습니다.</h2>
            <p>첫 번째 여행을 찾아보세요.</p>
            <Button onClick={() => void navigate(routePaths.tours)}>여행 둘러보기</Button>
          </section>
        ) : null}

        {trips.length > 0 ? (
          <section aria-labelledby="trip-history-heading" className={styles.history}>
            <div className={styles.sectionHeading}>
              <h2 id="trip-history-heading">Previous trips</h2>
              {history.isFetching ? (
                <p aria-live="polite">여행 기록을 새로 확인하고 있습니다.</p>
              ) : null}
            </div>

            {history.isError ? (
              <div className={styles.refreshError}>
                <p role="alert">
                  {isBrowserOffline()
                    ? '오프라인 상태입니다. 저장된 여행 기록을 표시하고 있습니다.'
                    : '최신 기록을 확인하지 못했습니다. 이전 기록을 표시합니다.'}
                </p>
                <Button onClick={() => void history.refetch()} size="small" variant="quiet">
                  다시 시도
                </Button>
              </div>
            ) : null}

            <ul className={styles.list}>
              {trips.map((trip) => (
                <li className={styles.card} key={trip.reservationId}>
                  <div className={styles.cardHeading}>
                    <p className={styles.theme}>{trip.tourProduct.theme.replaceAll('_', ' ')}</p>
                    <h3>{trip.tourProduct.name}</h3>
                  </div>
                  <dl className={styles.metadata}>
                    <div>
                      <dt>기간</dt>
                      <dd>{formatDateRange(trip.startDate, trip.endDate)}</dd>
                    </div>
                    <div>
                      <dt>등급</dt>
                      <dd>{trip.style}</dd>
                    </div>
                    <div>
                      <dt>가격</dt>
                      <dd>{formatPrice(trip.price.amount, trip.price.currency)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </PageContainer>
    </div>
  );
}
