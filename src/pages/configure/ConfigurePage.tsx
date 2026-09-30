import { useParams } from 'react-router';

import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';
import { routePatterns } from '@/app/router/paths';

export function ConfigurePage() {
  const { tourId } = useParams();

  return (
    <RoutePlaceholder
      matchedParam={{ label: 'tourId', value: tourId }}
      routeName={routePatterns.configure}
      screenName="Configure"
    />
  );
}
