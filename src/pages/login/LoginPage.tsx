import { routePaths, routeTitles } from '@/app/router/paths';
import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';

export function LoginPage() {
  return <RoutePlaceholder routeName={routePaths.login} title={routeTitles.login} />;
}
