import styles from '@/features/tour-discovery/ToursIntro.module.css';

export function ToursIntro() {
  return (
    <header className={styles.root}>
      <p className={styles.eyebrow}>Theme Tours</p>
      <h1>Four ways to travel differently.</h1>
      <p className={styles.supporting}>
        Compare each Theme, then choose the TourProduct that feels right for your journey.
      </p>
    </header>
  );
}
