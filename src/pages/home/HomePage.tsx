import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';
import { routePaths } from '@/app/router/paths';

export function HomePage() {
  return <RoutePlaceholder routeName={routePaths.home} screenName="Home" />;
}
