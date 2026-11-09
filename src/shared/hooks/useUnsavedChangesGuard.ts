import { useCallback, useEffect, useRef } from 'react';
import { useBlocker } from 'react-router';

export interface UnsavedChangesGuard {
  /** 앱 안 이동이 막혀 확인을 기다리는 중인가 */
  isBlocked: boolean;
  /** 이동을 취소하고 현재 화면에 남는다 */
  stay: () => void;
  /** 변경 사항을 버리고 막혔던 이동을 계속한다 */
  leave: () => void;
  /**
   * 저장 성공 직후처럼 화면이 직접 일으키는 다음 이동 한 번은 막지 않는다.
   * WHY: dirty 상태는 다음 render에서야 false가 되므로, 같은 tick의 navigate가
   * 막히지 않도록 ref로 우회를 표시한다.
   */
  allowNextNavigation: () => void;
}

/**
 * 저장하지 않은 입력이 있을 때 이동을 확인받는다 (CP5 §3.7, CP6-F §3).
 *
 * - 앱 안 이동(링크, 뒤로 가기, 로그아웃 이동): React Router blocker → 호출자가 Dialog로 확인
 * - 새로고침/탭 닫기: 브라우저 기본 `beforeunload` 확인
 *
 * CONTRACT: 확인 UI와 문구는 호출자가 소유한다. 이 hook은 business 의미가 없다.
 */
export function useUnsavedChangesGuard(isDirty: boolean): UnsavedChangesGuard {
  const bypassRef = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (bypassRef.current) {
      bypassRef.current = false;
      return false;
    }

    return (
      isDirty &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search)
    );
  });

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const stay = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  const leave = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker]);

  const allowNextNavigation = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return { isBlocked: blocker.state === 'blocked', stay, leave, allowNextNavigation };
}
