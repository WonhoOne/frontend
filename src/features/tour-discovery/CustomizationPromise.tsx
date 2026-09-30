import { TextLink } from '@/shared/ui';

import styles from '@/features/tour-discovery/CustomizationPromise.module.css';

interface CustomizationPromiseProps {
  toursHref: string;
}

const customizationSteps = [
  ['01', 'Choose a Theme'],
  ['02', 'Choose a Tour Style'],
  ['03', 'Change Hotel / Transport / Meal'],
] as const;

/**
 * Home에서 configuration 절차를 수행하지 않고 product promise만 전달한다.
 */
export function CustomizationPromise({ toursHref }: CustomizationPromiseProps) {
  return (
    <section aria-labelledby="customization-title" className={styles.root}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Made to be yours</p>
        <h2 id="customization-title">A package is only the starting point.</h2>
        <p>
          Begin with a Theme, choose the style that fits your trip, then shape the details around
          the experience you want.
        </p>
      </div>

      <ol className={styles.steps}>
        {customizationSteps.map(([number, label]) => (
          <li key={number}>
            <span aria-hidden="true">{number}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>

      <TextLink className={styles.action ?? ''} to={toursHref}>
        See all tours
        <span aria-hidden="true">→</span>
      </TextLink>
    </section>
  );
}
