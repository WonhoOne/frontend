import styles from '@/features/tour-discovery/TourStyleExplainer.module.css';

const styleSummaries = [
  {
    name: 'Classic',
    summary: '3-star hotel · lunch box',
    availability: 'Available for Golf Challenge and Outdoor Trekking.',
  },
  {
    name: 'Grand',
    summary: '4-star hotel · local restaurant',
    availability: 'Available across all four Themes.',
  },
  {
    name: 'Premium',
    summary: '5-star hotel · premium restaurant / steak · champagne',
    availability: 'Available across all four Themes.',
  },
] as const;

/**
 * Shared baseline의 TourStyle 의미를 비교용으로만 설명한다.
 * 실제 Style 선택은 Tour Detail이 소유한다.
 */
export function TourStyleExplainer() {
  return (
    <section aria-labelledby="tour-style-heading" className={styles.root}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Tour Styles</p>
        <h2 id="tour-style-heading">Start with a style. Then make the trip yours.</h2>
        <p>
          Style sets the starting point. Hotel, transport, and meal choices can still be changed
          later in the journey.
        </p>
      </div>

      <dl className={styles.grid}>
        {styleSummaries.map((style) => (
          <div className={styles.item} key={style.name}>
            <dt>{style.name}</dt>
            <dd>{style.summary}</dd>
            <dd className={styles.availability}>{style.availability}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
