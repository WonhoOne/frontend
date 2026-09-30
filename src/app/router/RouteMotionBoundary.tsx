import { useEffect, useRef, useState } from 'react';
import { NavigationType, useLocation, useNavigationType, useOutlet } from 'react-router';

import styles from '@/app/router/RouteMotionBoundary.module.css';

export type RouteMotionDirection = 'entry' | 'forward' | 'back';

function readHistoryIndex(state: unknown): number | null {
  if (typeof state !== 'object' || state === null || !('idx' in state)) {
    return null;
  }

  const index = Reflect.get(state, 'idx');

  return typeof index === 'number' ? index : null;
}

/**
 * Route가 확정된 직후 새 Page surface에 방향성 있는 entry motion을 적용한다.
 *
 * INVARIANT: 이전 Page animation 종료를 기다리거나 queue에 쌓지 않는다.
 * location key가 바뀌면 이전 surface는 즉시 교체되어 항상 latest route가 visual을 소유한다.
 *
 * CONTRACT: PUSH/REPLACE는 forward로 처리하고 browser POP은 history index 변화로
 * Back/Forward를 구분한다. URL depth나 Product hierarchy를 navigation 의미로 추측하지 않는다.
 */
export function RouteMotionBoundary() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet();
  const historyIndexRef = useRef(readHistoryIndex(window.history.state));
  const [popDirection, setPopDirection] = useState<RouteMotionDirection>('entry');

  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      const previousIndex = historyIndexRef.current;
      const nextIndex = readHistoryIndex(event.state);

      if (previousIndex !== null && nextIndex !== null) {
        setPopDirection(nextIndex < previousIndex ? 'back' : 'forward');
      } else {
        setPopDirection('back');
      }

      historyIndexRef.current = nextIndex;
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (navigationType !== NavigationType.Pop) {
      historyIndexRef.current = readHistoryIndex(window.history.state);
    }
  }, [location.key, navigationType]);

  const direction = navigationType === NavigationType.Pop ? popDirection : 'forward';

  return (
    <div
      className={styles.surface}
      data-route-motion-direction={direction}
      data-route-motion-key={location.key}
      key={location.key}
    >
      {outlet}
    </div>
  );
}
