import { useParams } from 'react-router';

import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';
import { routePatterns } from '@/app/router/paths';

export function ReservationSuccessPage() {
  const { reservationId } = useParams();

  return (
    <RoutePlaceholder
      matchedParam={{ label: 'reservationId', value: reservationId }}
      routeName={routePatterns.reservationSuccess}
      screenName="Reservation Success"
    />
  );
}
