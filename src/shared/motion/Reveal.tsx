import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import styles from '@/shared/motion/Reveal.module.css';

interface RevealProps {
  children: ReactNode;
  kind: 'section' | 'image';
  className?: string;
}

function Reveal({ children, className, kind }: RevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = rootRef.current;

    if (element === null) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting !== true) {
          return;
        }

        setIsRevealed(true);
        observer.disconnect();
      },
      {
        threshold: 0.15,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const classes = [styles.root, styles[kind], className].filter(Boolean).join(' ');

  return (
    <div className={classes} data-revealed={isRevealed} ref={rootRef}>
      {children}
    </div>
  );
}

/**
 * Page가 소유하는 section choreography에 사용하는 one-time reveal helper다.
 *
 * INVARIANT: viewport 재진입마다 animation을 반복하지 않는다.
 * Product timing/sequencing은 Page가 wrapper 배치와 순서로 소유한다.
 */
export function SectionReveal({ children, className }: Omit<RevealProps, 'kind'>) {
  return (
    <Reveal {...(className !== undefined ? { className } : {})} kind="section">
      {children}
    </Reveal>
  );
}

/**
 * Editorial/media surface를 위한 one-time image reveal helper다.
 *
 * CONTRACT: 이미지 loading/failure semantics는 ImageFrame 같은 media Component가 소유하고,
 * 이 helper는 reveal presentation만 제공한다.
 */
export function ImageReveal({ children, className }: Omit<RevealProps, 'kind'>) {
  return (
    <Reveal {...(className !== undefined ? { className } : {})} kind="image">
      {children}
    </Reveal>
  );
}
