import { routePaths, routeTitles } from '@/app/router/paths';
import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';

export function HomePage() {
  return <RoutePlaceholder routeName={routePaths.home} title={routeTitles.home} />;
}
