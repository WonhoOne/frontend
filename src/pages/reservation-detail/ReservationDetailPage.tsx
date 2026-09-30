import { useParams } from 'react-router';

import { routePatterns, routeTitles } from '@/app/router/paths';
import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';

export function ReservationDetailPage() {
  const { reservationId } = useParams();

  return (
    <RoutePlaceholder
      matchedParam={{ label: 'reservationId', value: reservationId }}
      routeName={routePatterns.reservationDetail}
      title={routeTitles.reservationDetail}
    />
  );
}
