import { OptionCard, PageContainer } from '@/shared/ui';

import type { TourDetailStyle } from '@/features/tour-detail/tourDetail.model';

import styles from '@/features/tour-detail/TourStyleSelection.module.css';

interface TourStyleSelectionProps {
  availableStyles: readonly TourDetailStyle[];
  selectedStyle: TourDetailStyle | null;
  onChange: (style: TourDetailStyle) => void;
}

const stylePresentation: Record<TourDetailStyle, { label: string; baseline: string }> = {
  CLASSIC: {
    label: 'Classic',
    baseline: '3-star hotel · Lunch box meal',
  },
  GRAND: {
    label: 'Grand',
    baseline: '4-star hotel · Local restaurant',
  },
  PREMIUM: {
    label: 'Premium',
    baseline: '5-star hotel · Premium restaurant · Steak · Champagne',
  },
};

/**
 * Tour Detail의 Style 선택 UI다.
 *
 * CONTRACT:
 * - availableStyles는 TourProduct Frontend Model이 제공한 허용 범위만 렌더링한다.
 * - 초기 선택을 임의로 만들지 않는다.
 * - native radio semantics가 selection과 keyboard behavior를 소유한다.
 * - ReservationDraft/Configure state에는 아직 쓰지 않는다.
 */
export function TourStyleSelection({
  availableStyles,
  selectedStyle,
  onChange,
}: TourStyleSelectionProps) {
  return (
    <section aria-labelledby="tour-style-title" className={styles.root}>
      <PageContainer variant="wide">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Choose your style</p>
          <h2 id="tour-style-title">Set the starting point for your trip.</h2>
          <p>
            Style sets a baseline for hotel and meal quality. You can customize hotel, transport and
            meal choices later.
          </p>
        </div>

        <fieldset aria-describedby="tour-style-help" className={styles.fieldset}>
          <legend className={styles.visuallyHidden}>Tour style options</legend>

          <div className={styles.grid}>
            {availableStyles.map((style) => {
              const presentation = stylePresentation[style];
              const inputId = `tour-style-${style.toLowerCase()}`;
              const isSelected = selectedStyle === style;

              return (
                <OptionCard className={styles.option ?? ''} isSelected={isSelected} key={style}>
                  <label className={styles.label} htmlFor={inputId}>
                    <span className={styles.topLine}>
                      <span className={styles.name}>{presentation.label}</span>
                      <input
                        checked={isSelected}
                        id={inputId}
                        name="tour-style"
                        onChange={() => onChange(style)}
                        type="radio"
                        value={style}
                      />
                    </span>
                    <span className={styles.baseline}>{presentation.baseline}</span>
                  </label>
                </OptionCard>
              );
            })}
          </div>

          <p className={styles.help} id="tour-style-help">
            No style is selected for you. Choose one when you are ready.
          </p>
        </fieldset>
      </PageContainer>
    </section>
  );
}
