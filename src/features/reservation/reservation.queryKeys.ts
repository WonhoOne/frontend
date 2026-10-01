export const reservationQueryKeys = {
  all: ['reservation'] as const,
  detail: (reservationId: number) => ['reservation', 'detail', reservationId] as const,
};

/**
 * Reservation server-state key는 Feature boundary가 소유한다.
 * private Customer resource이므로 Auth lifecycle에서 Session E가 이 prefix를 clear할 수 있도록
 * public API로 노출하되 QueryClient/AppProviders composition은 이 Feature가 소유하지 않는다.
 */
export const reservationPrivateQueryKey = reservationQueryKeys.all;
