import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';
import { routePaths } from '@/app/router/paths';

export function LoginPage() {
  return <RoutePlaceholder routeName={routePaths.login} screenName="Login" />;
}
