import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';
import { routePaths } from '@/app/router/paths';

export function MyTripsPage() {
  return <RoutePlaceholder routeName={routePaths.myTrips} screenName="My Trips" />;
}
