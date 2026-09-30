import { useSyncExternalStore } from 'react';

import { ConfigurationOptionGroup } from '@/features/configuration/ConfigurationOptionGroup';
import { DesktopTripSummary } from '@/features/configuration/DesktopTripSummary';
import { MobileTripSummary } from '@/features/configuration/MobileTripSummary';
import { ParticipantCountField } from '@/features/configuration/ParticipantCountField';
import { buildConfigureTripSummary } from '@/features/configuration/configurePresentation';
import { getConfigureReadiness } from '@/features/configuration/configureReadiness';
import type { ConfigureFixtureScenario } from '@/features/configuration/configurationFixtures';
import type { ConfigurationCategory } from '@/features/configuration/configurationModels';
import {
  createReadyConfigureRuntimeState,
  type ConfigureRuntimeState,
} from '@/features/configuration/configureRuntimeState';
import { useReservationDraft, type ParticipantCountRule } from '@/features/reservation';

import styles from '@/features/configuration/ConfigureDesktop.module.css';

const DESKTOP_CONFIGURE_QUERY = '(min-width: 1024px)';

interface ConfigureDesktopProps {
  participantRule: ParticipantCountRule;
  scenario: ConfigureFixtureScenario;
  tourProductId: string;
  onReview: () => void;
  runtimeState?: ConfigureRuntimeState;
  onRetryGroup?: (category: ConfigurationCategory) => void;
  onReturnToTour?: () => void;
  now?: () => number;
}

function selectedKeyForCategory(
  category: ConfigurationCategory,
  configuration: ReturnType<typeof useReservationDraft>['draft']['configuration'],
): string | null {
  switch (category) {
    case 'hotel':
      return configuration.hotelSelectionKey;
    case 'transport':
      return configuration.transportSelectionKey;
    case 'meal':
      return configuration.mealSelectionKey;
    case 'extras':
      return null;
  }
}

function getDesktopSnapshot() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }

  return window.matchMedia(DESKTOP_CONFIGURE_QUERY).matches;
}

function subscribeToDesktopBreakpoint(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(DESKTOP_CONFIGURE_QUERY);
  mediaQuery.addEventListener('change', onChange);

  return () => {
    mediaQuery.removeEventListener('change', onChange);
  };
}

function useDesktopConfigureLayout() {
  return useSyncExternalStore(subscribeToDesktopBreakpoint, getDesktopSnapshot, () => true);
}

export function ConfigureDesktop({
  participantRule,
  scenario,
  tourProductId,
  onReview,
  runtimeState = createReadyConfigureRuntimeState(),
  onRetryGroup = () => undefined,
  onReturnToTour = () => undefined,
  now = Date.now,
}: ConfigureDesktopProps) {
  const { draft, dispatch } = useReservationDraft();
  const isDesktop = useDesktopConfigureLayout();
  const summary = buildConfigureTripSummary({
    draft,
    participantRule,
    scenario,
    runtimeState,
  });
  const readiness = getConfigureReadiness({
    draft,
    expectedTourProductId: tourProductId,
    groups: scenario.groups,
    participantRule,
    runtimeState,
  });

  function selectConfiguration(category: ConfigurationCategory, selectionKey: string) {
    const updatedAt = now();

    switch (category) {
      case 'hotel':
        dispatch({ type: 'SELECT_HOTEL', selectionKey, updatedAt });
        break;
      case 'transport':
        dispatch({ type: 'SELECT_TRANSPORT', selectionKey, updatedAt });
        break;
      case 'meal':
        dispatch({ type: 'SELECT_MEAL', selectionKey, updatedAt });
        break;
      case 'extras':
        break;
    }
  }

  return (
    <div className={styles.layout}>
      <div className={styles.configuration}>
        {runtimeState.connectivity === 'offline' ? (
          <div aria-live="polite" className={styles.offlineBanner} role="status">
            You are offline. Option availability may be out of date.
          </div>
        ) : null}

        <section aria-labelledby="participant-heading" className={styles.participants}>
          <header className={styles.participantHeading}>
            <p className={styles.sectionEyebrow}>Travel party</p>
            <h2 id="participant-heading">Who is traveling?</h2>
          </header>

          <ParticipantCountField
            onParticipantCountChange={(participantCount) =>
              dispatch({
                type: 'SET_PARTICIPANT_COUNT',
                participantCount,
                updatedAt: now(),
              })
            }
            participantCount={draft.participantCount}
            rule={participantRule}
          />
        </section>

        {scenario.groups.map((group, index) => (
          <ConfigurationOptionGroup
            group={group}
            key={group.category}
            onRetry={() => onRetryGroup(group.category)}
            onReturnToTour={onReturnToTour}
            onSelect={(selectionKey) => selectConfiguration(group.category, selectionKey)}
            runtimeState={runtimeState.groups[group.category]}
            selectedKey={selectedKeyForCategory(group.category, draft.configuration)}
            stepNumber={index + 1}
          />
        ))}
      </div>

      {isDesktop ? (
        <div className={styles.summaryColumn}>
          <DesktopTripSummary onReview={onReview} readiness={readiness} summary={summary} />
        </div>
      ) : (
        <MobileTripSummary onReview={onReview} readiness={readiness} summary={summary} />
      )}
    </div>
  );
}
