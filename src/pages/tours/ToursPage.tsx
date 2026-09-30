import { useSearchParams } from 'react-router';

import { routeBuilders, routePaths } from '@/app/router/paths';
import {
  EmptyState,
  LoadingState,
  OfflineBanner,
  RefreshIndicator,
  SectionError,
} from '@/app/state';
import {
  groupTourProductsByTheme,
  readThemeFromSearchParams,
  TourCollectionSkeleton,
  type TourDiscoveryCollectionErrorReason,
  type TourDiscoveryCollectionState,
  TourStyleExplainer,
  type TourTheme,
  TourThemeGroup,
  ToursIntro,
  tourDiscoveryPreviewStates,
} from '@/features/tour-discovery';
import { SectionReveal } from '@/shared/motion';
import { Button, PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/tours/ToursPage.module.css';

const footerNavigation = [
  { label: 'Home', to: routePaths.home },
  { label: 'My Trips', to: routePaths.myTrips },
  { label: 'Login / Account', to: routePaths.login },
] as const;

interface ToursPageViewProps {
  collectionState: TourDiscoveryCollectionState;
  focusedTheme: TourTheme | null;
  onRetry?: () => void;
  onRetryTheme?: (theme: TourTheme) => void;
}

const collectionErrorCopy: Record<
  TourDiscoveryCollectionErrorReason,
  { title: string; message: string }
> = {
  network: {
    title: 'Travel journeys are unavailable.',
    message: 'Check your connection and try again.',
  },
  server: {
    title: 'Travel journeys are unavailable.',
    message: 'Please try again shortly.',
  },
  'data-mismatch': {
    title: "We couldn't prepare this collection.",
    message: 'The collection could not be displayed safely. Try again to reload it.',
  },
};

function ToursCollectionStateView({
  collectionState,
  focusedTheme,
  onRetry,
  onRetryTheme,
}: ToursPageViewProps) {
  if (collectionState.status === 'loading') {
    return (
      <LoadingState label="Loading tour collection">
        <TourCollectionSkeleton />
      </LoadingState>
    );
  }

  if (collectionState.status === 'empty') {
    return (
      <EmptyState
        action={
          <div className={styles.stateActions}>
            {onRetry !== undefined ? <Button onClick={onRetry}>Try again</Button> : null}
            <TextLink to={routePaths.home}>Home</TextLink>
          </div>
        }
        title="No journeys to show right now."
      >
        <p>Please check again shortly or return to Home.</p>
      </EmptyState>
    );
  }

  if (collectionState.status === 'error') {
    const copy = collectionErrorCopy[collectionState.reason];

    return (
      <SectionError
        isRetrying={collectionState.isRetrying ?? false}
        onRetry={onRetry ?? (() => undefined)}
        retryLabel="Retry journeys"
        retryingLabel="Retrying journeys"
        title={copy.title}
      >
        <p>{copy.message}</p>
      </SectionError>
    );
  }

  const groups = groupTourProductsByTheme(collectionState.products);
  const unavailableThemes = new Set(collectionState.unavailableThemes ?? []);

  return (
    <div>
      {collectionState.offline === true ? (
        <div className={styles.connectivity}>
          <OfflineBanner>
            You're offline. Showing saved journeys that may be out of date.
          </OfflineBanner>
        </div>
      ) : null}
      {collectionState.freshness === 'refreshing' ? (
        <div className={styles.freshness}>
          <RefreshIndicator label="Updating journeys" state="refreshing" />
        </div>
      ) : null}
      {collectionState.freshness === 'stale' ? (
        <div className={styles.freshness}>
          <RefreshIndicator
            label="Showing saved journeys while refresh is unavailable"
            state="stale"
          />
        </div>
      ) : null}

      <div className={styles.collection}>
        {groups.map((group) => {
          const theme = group.presentation.theme;
          const unavailable = unavailableThemes.has(theme);

          return (
            <SectionReveal key={theme}>
              <TourThemeGroup
                focused={focusedTheme === theme}
                getProductHref={(product) => routeBuilders.tourDetail(product.id)}
                group={group}
                {...(unavailable && onRetryTheme !== undefined
                  ? { onRetryUnavailable: () => onRetryTheme(theme) }
                  : {})}
                unavailable={unavailable}
              />
            </SectionReveal>
          );
        })}
      </div>
    </div>
  );
}

export function ToursPageView(props: ToursPageViewProps) {
  return (
    <div className={styles.page}>
      <PageContainer className={styles.content ?? ''} variant="main">
        <SectionReveal>
          <ToursIntro />
        </SectionReveal>

        <ToursCollectionStateView {...props} />

        <SectionReveal>
          <TourStyleExplainer />
        </SectionReveal>
      </PageContainer>

      <footer className={styles.footer}>
        <PageContainer className={styles.footerInner ?? ''} variant="main">
          <div>
            <p className={styles.footerBrand}>Mister World</p>
            <p className={styles.footerNote}>Choose a Theme. Then choose the journey within it.</p>
          </div>
          <nav aria-label="Footer">
            {footerNavigation.map((item) => (
              <TextLink key={item.to} to={item.to}>
                {item.label}
              </TextLink>
            ))}
          </nav>
        </PageContainer>
      </footer>
    </div>
  );
}

export function ToursPage() {
  const [searchParams] = useSearchParams();
  const focusedTheme = readThemeFromSearchParams(searchParams);

  return (
    <ToursPageView collectionState={tourDiscoveryPreviewStates.happy} focusedTheme={focusedTheme} />
  );
}
