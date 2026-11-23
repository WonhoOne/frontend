import { useContext, useSyncExternalStore } from 'react';
import { useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query';
import { matchPath, useLocation, useNavigate } from 'react-router';
import { routeBuilders, routePaths, routePatterns } from '@/app/router/paths';
import { isCustomerSession } from '@/features/auth';
import { AuthContext } from '@/features/auth/authContext';
import { createSharedContractConfigureScenario } from '@/features/configuration';
import { useReservationDraft } from '@/features/reservation';
import {
  tourDetailQueryKey,
  tourScheduleQueryKey,
  type TourDetailModel,
  type ScheduleChoiceModel,
} from '@/features/tour-detail';
import { tourDiscoveryQueryKey, type TourProductSummaryModel } from '@/features/tour-discovery';
import { LiveVoiceControl } from '@/features/voice-bridge/live';
import type { LiveVoiceChoices } from '@/features/voice-bridge/liveVoiceContext';
import { parseResourceIdRouteParam } from '@/shared/lib/resourceIdentity';
import { createVoiceCommandHints } from './customerVoiceHints';
import { VoiceCommandHints } from './VoiceCommandHints';

const NO_QUERY_KEY = ['customer-voice-control', 'none'] as const;

/** Read existing public Query data only. Voice adds no HTTP reads or private-cache access. */
export function CustomerVoiceControl() {
  const queryClient = useQueryClient();
  const { draft } = useReservationDraft();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Optional read of the existing session (no HTTP); outside AuthProvider the name is omitted.
  const auth = useContext(AuthContext);
  const customerName = auth && isCustomerSession(auth.state) ? auth.state.user.name : null;
  const configure = matchPath(routePatterns.configure, pathname);
  const detail = matchPath(routePatterns.tourDetail, pathname);
  const id = parseResourceIdRouteParam((configure ?? detail)?.params.tourId);
  const discovery = pathname === routePaths.home || pathname === routePaths.tours;
  // Hints re-render from the same cached entries Voice reads; subscribing never fetches.
  const products = useCachedQueryData<readonly TourProductSummaryModel[]>(
    queryClient,
    tourDiscoveryQueryKey,
  );
  const product = useCachedQueryData<TourDetailModel>(
    queryClient,
    id === null ? NO_QUERY_KEY : tourDetailQueryKey(id),
  );
  const schedules = useCachedQueryData<readonly ScheduleChoiceModel[]>(
    queryClient,
    id === null ? NO_QUERY_KEY : tourScheduleQueryKey(id),
  );
  // No recognition lifetime on Auth, Review/Submit, History or Employee surfaces.
  if (!discovery && id === null) return null;

  const screen: LiveVoiceChoices['screen'] = discovery
    ? 'discovery'
    : configure
      ? 'configure'
      : 'detail';
  const hints = createVoiceCommandHints(
    {
      screen,
      products: products ?? [],
      product: id === null ? undefined : product,
      schedules: id === null ? [] : (schedules ?? []),
      scenario: createSharedContractConfigureScenario(),
    },
    draft,
  );

  return (
    <>
      <LiveVoiceControl
        guidedDialog={{ getCustomerName: () => customerName }}
        getChoices={() => ({
          screen,
          products:
            queryClient.getQueryData<readonly TourProductSummaryModel[]>(tourDiscoveryQueryKey) ??
            [],
          product:
            id === null
              ? undefined
              : queryClient.getQueryData<TourDetailModel>(tourDetailQueryKey(id)),
          schedules:
            id === null
              ? []
              : (queryClient.getQueryData<readonly ScheduleChoiceModel[]>(
                  tourScheduleQueryKey(id),
                ) ?? []),
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
      <VoiceCommandHints hints={hints} />
    </>
  );
}

function useCachedQueryData<T>(queryClient: QueryClient, queryKey: QueryKey): T | undefined {
  return useSyncExternalStore(
    (onChange) => queryClient.getQueryCache().subscribe(onChange),
    () => queryClient.getQueryData<T>(queryKey),
  );
}
