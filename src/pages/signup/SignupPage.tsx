import { routePaths, routeTitles } from '@/app/router/paths';
import { RoutePlaceholder } from '@/app/router/RoutePlaceholder';

export function SignupPage() {
  return <RoutePlaceholder routeName={routePaths.signup} title={routeTitles.signup} />;
}
