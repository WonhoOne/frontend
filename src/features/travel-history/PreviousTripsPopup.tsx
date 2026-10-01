import { useNavigate } from 'react-router';

import { routePaths } from '@/app/router/paths';
import type { TravelHistoryDataSource } from '@/features/travel-history/TravelHistoryDataSource';
import { useDesktopHistorySurface } from '@/features/travel-history/useDesktopHistorySurface';
import { useTravelHistory } from '@/features/travel-history/travelHistory.query';
import { BottomSheet, Button, Dialog, Skeleton } from '@/shared/ui';

import styles from '@/features/travel-history/PreviousTripsPopup.module.css';

interface PreviousTripsPopupProps {
  dataSource: TravelHistoryDataSource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

function HistoryContent({
  dataSource,
  onOpenChange,
}: Pick<PreviousTripsPopupProps, 'dataSource' | 'onOpenChange'>) {
  const navigate = useNavigate();
  const history = useTravelHistory(dataSource);

  if (history.isPending) {
    return (
      <div aria-busy="true" aria-label="지난 여행 불러오는 중" className={styles.state}>
        {[0, 1, 2].map((index) => (
          <div className={styles.skeletonCard} key={index}>
            <Skeleton className={styles.skeletonTitle} variant="line" />
            <Skeleton className={styles.skeletonLine} variant="line" />
            <Skeleton className={styles.skeletonLine} variant="line" />
          </div>
        ))}
      </div>
    );
  }

  if (history.isError && history.data === undefined) {
    return (
      <div className={styles.state}>
        <p role="alert">지난 여행을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
        <Button onClick={() => void history.refetch()} variant="secondary">
          다시 시도
        </Button>
      </div>
    );
  }

  const trips = history.data ?? [];

  if (trips.length === 0) {
    return (
      <div className={styles.state}>
        <p>아직 지난 여행이 없습니다.</p>
        <p>첫 번째 여행을 만나보세요.</p>
        <Button
          onClick={() => {
            onOpenChange(false);
            void navigate(routePaths.tours);
          }}
        >
          여행 둘러보기
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      {history.isFetching ? (
        <p aria-live="polite" className={styles.refreshing}>
          여행 기록을 새로 확인하고 있습니다.
        </p>
      ) : null}
      {history.isError ? (
        <div className={styles.refreshError}>
          <p role="alert">최신 여행 기록을 확인하지 못했습니다. 이전 기록을 표시합니다.</p>
          <Button onClick={() => void history.refetch()} size="small" variant="quiet">
            다시 시도
          </Button>
        </div>
      ) : null}
      <ul className={styles.list}>
        {trips.map((trip) => (
          <li className={styles.card} key={trip.reservationId}>
            <div>
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
      <Button
        className={styles.viewAll}
        onClick={() => {
          onOpenChange(false);
          void navigate(routePaths.myTrips);
        }}
      >
        전체 여행 보기
      </Button>
    </div>
  );
}

export function PreviousTripsPopup({ dataSource, onOpenChange, open }: PreviousTripsPopupProps) {
  const desktop = useDesktopHistorySurface();
  const sharedProps = {
    closeLabel: '닫기',
    description: '최근 이용한 여행 기록을 확인하세요.',
    onOpenChange,
    open,
    title: 'Your previous trips',
  };

  if (desktop) {
    return (
      <Dialog {...sharedProps}>
        <HistoryContent dataSource={dataSource} onOpenChange={onOpenChange} />
      </Dialog>
    );
  }

  return (
    <BottomSheet {...sharedProps}>
      <HistoryContent dataSource={dataSource} onOpenChange={onOpenChange} />
    </BottomSheet>
  );
}
