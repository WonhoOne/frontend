import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';
import { routePaths } from '@/app/router/paths';

export function ToursPage() {
  return <RoutePlaceholder routeName={routePaths.tours} screenName="Tours" />;
}
