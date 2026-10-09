import { useQueryClient } from '@tanstack/react-query';
import { matchPath, useLocation, useNavigate } from 'react-router';
import { routeBuilders, routePaths, routePatterns } from '@/app/router/paths';
import { createSharedContractConfigureScenario } from '@/features/configuration';
import {
  tourDetailQueryKey,
  tourScheduleQueryKey,
  type TourDetailModel,
  type ScheduleChoiceModel,
} from '@/features/tour-detail';
import { tourDiscoveryQueryKey, type TourProductSummaryModel } from '@/features/tour-discovery';
import { LiveVoiceControl } from '@/features/voice-bridge/live';
import { parseResourceIdRouteParam } from '@/shared/lib/resourceIdentity';

/** Read existing public Query data only. Voice adds no HTTP reads or private-cache access. */
export function CustomerVoiceControl() {
  const queryClient = useQueryClient();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const configure = matchPath(routePatterns.configure, pathname);
  const detail = matchPath(routePatterns.tourDetail, pathname);
  const id = parseResourceIdRouteParam((configure ?? detail)?.params.tourId);
  const discovery = pathname === routePaths.home || pathname === routePaths.tours;
  // No recognition lifetime on Auth, Review/Submit, History or Employee surfaces.
  if (!discovery && id === null) return null;
  const theme = new URLSearchParams(search).get('theme');

  return (
    <LiveVoiceControl
      getChoices={() => ({
        screen: discovery ? 'discovery' : configure ? 'configure' : 'detail',
        products: (
          queryClient.getQueryData<readonly TourProductSummaryModel[]>(tourDiscoveryQueryKey) ?? []
        ).filter((product) => theme === null || product.theme === theme),
        product:
          id === null
            ? undefined
            : queryClient.getQueryData<TourDetailModel>(tourDetailQueryKey(id)),
        schedules:
          id === null
            ? []
            : (queryClient.getQueryData<readonly ScheduleChoiceModel[]>(tourScheduleQueryKey(id)) ??
              []),
        scenario: createSharedContractConfigureScenario(),
      })}
      showTours={(theme) => {
        void navigate(theme === undefined ? routePaths.tours : routeBuilders.toursByTheme(theme));
      }}
      onProductSelected={(identity) => {
        const target = routeBuilders.tourDetail(identity);
        if (pathname !== target && pathname !== routeBuilders.configure(identity))
          void navigate(target);
      }}
    />
  );
}
