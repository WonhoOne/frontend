import { routePaths, routeTitles } from '@/app/router/paths';
import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';

export function ToursPage() {
  return <RoutePlaceholder routeName={routePaths.tours} title={routeTitles.tours} />;
}
