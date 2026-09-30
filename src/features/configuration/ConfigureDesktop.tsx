import { ConfigurationOptionGroup } from '@/features/configuration/ConfigurationOptionGroup';
import { DesktopTripSummary } from '@/features/configuration/DesktopTripSummary';
import { ParticipantCountField } from '@/features/configuration/ParticipantCountField';
import { buildConfigureTripSummary } from '@/features/configuration/configurePresentation';
import { getConfigureReadiness } from '@/features/configuration/configureReadiness';
import type { ConfigureFixtureScenario } from '@/features/configuration/configurationFixtures';
import type { ConfigurationCategory } from '@/features/configuration/configurationModels';
import { useReservationDraft, type ParticipantCountRule } from '@/features/reservation';

import styles from '@/features/configuration/ConfigureDesktop.module.css';

interface ConfigureDesktopProps {
  participantRule: ParticipantCountRule;
  scenario: ConfigureFixtureScenario;
  tourProductId: string;
  onReview: () => void;
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

export function ConfigureDesktop({
  participantRule,
  scenario,
  tourProductId,
  onReview,
  now = Date.now,
}: ConfigureDesktopProps) {
  const { draft, dispatch } = useReservationDraft();
  const summary = buildConfigureTripSummary({
    draft,
    participantRule,
    scenario,
  });
  const readiness = getConfigureReadiness({
    draft,
    expectedTourProductId: tourProductId,
    groups: scenario.groups,
    participantRule,
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
            onSelect={(selectionKey) => selectConfiguration(group.category, selectionKey)}
            selectedKey={selectedKeyForCategory(group.category, draft.configuration)}
            stepNumber={index + 1}
          />
        ))}
      </div>

      <div className={styles.summaryColumn}>
        <DesktopTripSummary onReview={onReview} readiness={readiness} summary={summary} />
      </div>
    </div>
  );
}
