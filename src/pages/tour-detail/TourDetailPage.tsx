import { useParams } from 'react-router';

import { routePatterns, routeTitles } from '@/app/router/paths';
import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';

export function TourDetailPage() {
  const { tourId } = useParams();

  return (
    <RoutePlaceholder
      matchedParam={{ label: 'tourId', value: tourId }}
      routeName={routePatterns.tourDetail}
      title={routeTitles.tourDetail}
    />
  );
}
