import { useParams } from 'react-router';

import { routePatterns, routeTitles } from '@/app/router/paths';
import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';

export function ReservationSuccessPage() {
  const { reservationId } = useParams();

  return (
    <RoutePlaceholder
      matchedParam={{ label: 'reservationId', value: reservationId }}
      routeName={routePatterns.reservationSuccess}
      title={routeTitles.reservationSuccess}
    />
  );
}
