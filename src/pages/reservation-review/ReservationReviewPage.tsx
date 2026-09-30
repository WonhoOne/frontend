import { routePaths, routeTitles } from '@/app/router/paths';
import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';

export function ReservationReviewPage() {
  return (
    <RoutePlaceholder
      routeName={routePaths.reservationReview}
      title={routeTitles.reservationReview}
    />
  );
}
