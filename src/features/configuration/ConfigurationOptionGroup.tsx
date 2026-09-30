import { useId } from 'react';

import type { OptionGroupModel } from '@/features/configuration/configurationModels';
import { OptionCard } from '@/shared/ui';

import styles from '@/features/configuration/ConfigurationOptionGroup.module.css';

interface ConfigurationOptionGroupProps {
  group: OptionGroupModel;
  stepNumber: number;
  selectedKey: string | null;
  onSelect: (selectionKey: string) => void;
}

export function ConfigurationOptionGroup({
  group,
  stepNumber,
  selectedKey,
  onSelect,
}: ConfigurationOptionGroupProps) {
  const headingId = useId();

  if (group.selectionMode === 'contract-dependent') {
    return (
      <section aria-labelledby={headingId} className={styles.group}>
        <header className={styles.headingBlock}>
          <p className={styles.step}>0{stepNumber}</p>
          <h2 id={headingId}>{group.heading}</h2>
          {group.helperText !== null ? <p className={styles.helper}>{group.helperText}</p> : null}
        </header>

        <div className={styles.contractNotice}>
          Extras are shown as a reserved configuration area until the approved Shared Contract
          defines their exact selection behavior.
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby={headingId} className={styles.group}>
      <header className={styles.headingBlock}>
        <p className={styles.step}>0{stepNumber}</p>
        <h2 id={headingId}>{group.heading}</h2>
        {group.helperText !== null ? <p className={styles.helper}>{group.helperText}</p> : null}
      </header>

      <div aria-labelledby={headingId} className={styles.options} role="radiogroup">
        {group.options.map((option) => {
          const isDisabled = option.availability.status === 'disabled';
          const isSelected = selectedKey === option.selectionKey;

          return (
            <OptionCard isDisabled={isDisabled} isSelected={isSelected} key={option.selectionKey}>
              <label className={styles.optionLabel}>
                <input
                  checked={isSelected}
                  className={styles.radio}
                  disabled={isDisabled}
                  name={`configuration-${group.category}`}
                  onChange={() => onSelect(option.selectionKey)}
                  type="radio"
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

                  {option.availability.status === 'disabled' ? (
                    <span className={styles.disabledReason}>{option.availability.reason}</span>
                  ) : null}
                </span>
              </label>
            </OptionCard>
          );
        })}
      </div>
    </section>
  );
}
