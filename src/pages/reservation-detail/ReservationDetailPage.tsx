import { useParams } from 'react-router';

import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';
import { routePatterns } from '@/app/router/paths';

export function ReservationDetailPage() {
  const { reservationId } = useParams();

  return (
    <RoutePlaceholder
      matchedParam={{ label: 'reservationId', value: reservationId }}
      routeName={routePatterns.reservationDetail}
      screenName="Reservation Detail"
    />
  );
}
