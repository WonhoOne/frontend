import { useId } from 'react';

import type { OptionGroupModel } from '@/features/configuration/configurationModels';
import type { ConfigurationGroupRuntimeState } from '@/features/configuration/configureRuntimeState';
import { Button, OptionCard, Skeleton } from '@/shared/ui';

import styles from '@/features/configuration/ConfigurationOptionGroup.module.css';

interface ConfigurationOptionGroupProps {
  group: OptionGroupModel;
  stepNumber: number;
  selectedKey: string | null;
  onSelect: (selectionKey: string) => void;
  selectedKeys?: readonly string[];
  onToggle?: (selectionKey: string) => void;
  runtimeState?: ConfigurationGroupRuntimeState;
  onRetry?: () => void;
  onReturnToTour?: () => void;
}

function GroupLoading({ heading }: { heading: string }) {
  return (
    <div aria-busy="true" aria-label={`${heading} options loading`} className={styles.loading}>
      <span className={styles.visuallyHidden}>Loading {heading} options</span>
      <div className={styles.skeletonOptions}>
        <Skeleton data-testid="configuration-option-skeleton" />
        <Skeleton data-testid="configuration-option-skeleton" />
      </div>
    </div>
  );
}

function GroupError({
  heading,
  isRetrying,
  onRetry,
}: {
  heading: string;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div aria-live="polite" className={styles.statePanel}>
      <div className={styles.stateCopy}>
        <h3>{heading} options unavailable</h3>
        <p>We could not load this option group. Other ready choices remain available.</p>
      </div>
      <Button
        isLoading={isRetrying}
        loadingLabel={`Retrying ${heading}`}
        onClick={onRetry}
        variant="secondary"
      >
        Retry {heading}
      </Button>
    </div>
  );
}

function GroupEmpty({
  group,
  onReturnToTour,
}: {
  group: OptionGroupModel;
  onReturnToTour: () => void;
}) {
  if (!group.required) {
    return <p className={styles.compactEmpty}>No extras are available for this trip.</p>;
  }

  return (
    <div className={styles.statePanel}>
      <div className={styles.stateCopy}>
        <h3>No {group.heading.toLowerCase()} options available</h3>
        <p>This required option group has no selectable choices. Review the trip details.</p>
      </div>
      <Button onClick={onReturnToTour} variant="secondary">
        Back to tour details
      </Button>
    </div>
  );
}

function RuntimeIndicator({ state }: { state: 'refreshing' | 'stale' }) {
  return (
    <span className={styles.runtimeIndicator} data-runtime-state={state} role="status">
      <span aria-hidden="true" className={styles.indicatorDot} />
      {state === 'refreshing' ? 'Updating availability' : 'Availability may be out of date'}
    </span>
  );
}

export function ConfigurationOptionGroup({
  group,
  stepNumber,
  selectedKey,
  onSelect,
  selectedKeys = [],
  onToggle,
  runtimeState = { status: 'ready' },
  onRetry = () => undefined,
  onReturnToTour = () => undefined,
}: ConfigurationOptionGroupProps) {
  const headingId = useId();
  const isMultiple = group.selectionMode === 'multiple';

  let content;

  if (runtimeState.status === 'loading') {
    content = <GroupLoading heading={group.heading} />;
  } else if (runtimeState.status === 'error') {
    content = (
      <GroupError heading={group.heading} isRetrying={runtimeState.isRetrying} onRetry={onRetry} />
    );
  } else if (runtimeState.status === 'empty') {
    content = <GroupEmpty group={group} onReturnToTour={onReturnToTour} />;
  } else {
    content = (
      <>
        {runtimeState.status === 'refreshing' || runtimeState.status === 'stale' ? (
          <RuntimeIndicator state={runtimeState.status} />
        ) : null}

        {runtimeState.status === 'invalid' ? (
          <div className={styles.invalidNotice} role="alert">
            Your selected {group.heading.toLowerCase()} option is no longer available. Change the
            selection.
          </div>
        ) : null}

        <div
          aria-labelledby={headingId}
          className={styles.options}
          role={isMultiple ? 'group' : 'radiogroup'}
        >
          {group.options.map((option) => {
            const isSelected = isMultiple
              ? selectedKeys.includes(option.selectionKey)
              : selectedKey === option.selectionKey;
            const isInvalidSelection = runtimeState.status === 'invalid' && isSelected;
            const isDisabled =
              option.availability.status === 'disabled' ||
              isInvalidSelection ||
              (isMultiple && onToggle === undefined);
            const disabledReason = isInvalidSelection
              ? 'This selection is no longer available. Choose another option.'
              : option.availability.status === 'disabled'
                ? option.availability.reason
                : null;

            return (
              <OptionCard isDisabled={isDisabled} isSelected={isSelected} key={option.selectionKey}>
                <label className={styles.optionLabel}>
                  <input
                    checked={isSelected}
                    className={styles.selectionInput}
                    disabled={isDisabled}
                    name={`configuration-${group.category}`}
                    onChange={() => {
                      if (isMultiple) {
                        onToggle?.(option.selectionKey);
                      } else {
                        onSelect(option.selectionKey);
                      }
                    }}
                    type={isMultiple ? 'checkbox' : 'radio'}
                    value={option.selectionKey}
                  />

                  <span className={styles.optionBody}>
                    <span className={styles.optionTitleRow}>
                      <span className={styles.optionTitle}>{option.title}</span>
                      <span aria-hidden="true" className={styles.selectedMarker}>
                        {isSelected ? 'Selected' : ''}
                      </span>
                    </span>

                    {option.description !== null ? (
                      <span className={styles.optionDescription}>{option.description}</span>
                    ) : null}

                    {disabledReason !== null ? (
                      <span className={styles.disabledReason}>{disabledReason}</span>
                    ) : null}
                  </span>
                </label>
              </OptionCard>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <section aria-labelledby={headingId} className={styles.group}>
      <header className={styles.headingBlock}>
        <p className={styles.step}>0{stepNumber}</p>
        <h2 id={headingId}>{group.heading}</h2>
        {group.helperText !== null ? <p className={styles.helper}>{group.helperText}</p> : null}
      </header>

      {content}
    </section>
  );
}
