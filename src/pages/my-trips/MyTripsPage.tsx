import { routePaths, routeTitles } from '@/app/router/paths';
import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';

export function MyTripsPage() {
  return <RoutePlaceholder routeName={routePaths.myTrips} title={routeTitles.myTrips} />;
}
