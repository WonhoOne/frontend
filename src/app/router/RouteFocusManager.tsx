import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

const MAIN_CONTENT_ID = 'main-content';

/**
 * SPA route 전환 뒤 새 Page의 main landmark로 focus를 이동한다.
 *
 * INVARIANT: 초기 direct load에서는 browser의 기본 focus 순서를 보존해
 * skip link가 첫 keyboard target으로 남는다. 이후 route location이 바뀌면
 * focus만 이동하고 scroll position은 별도 restoration runtime이 소유한다.
 */
export function RouteFocusManager() {
  const location = useLocation();
  const previousLocationKeyRef = useRef(location.key);

  useEffect(() => {
    if (previousLocationKeyRef.current === location.key) {
      return;
    }

    previousLocationKeyRef.current = location.key;

    const mainContent = document.getElementById(MAIN_CONTENT_ID);

    if (!(mainContent instanceof HTMLElement)) {
      return;
    }

    mainContent.focus({ preventScroll: true });
  }, [location.key]);

  return null;
}
