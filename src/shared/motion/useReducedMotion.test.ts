// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useReducedMotion } from '@/shared/motion/useReducedMotion';

interface MatchMediaHarness {
  setMatches: (matches: boolean) => void;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

function installMatchMedia(initialMatches: boolean): MatchMediaHarness {
  let matches = initialMatches;
  let changeListener: ((event: MediaQueryListEvent) => void) | undefined;

  const addEventListener = vi.fn(
    (eventName: string, listener: (event: MediaQueryListEvent) => void) => {
      if (eventName === 'change') {
        changeListener = listener;
      }
    },
  );

  const removeEventListener = vi.fn(
    (eventName: string, listener: (event: MediaQueryListEvent) => void) => {
      if (eventName === 'change' && changeListener === listener) {
        changeListener = undefined;
      }
    },
  );

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      get matches() {
        return matches;
      },
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  return {
    addEventListener,
    removeEventListener,
    setMatches(nextMatches) {
      matches = nextMatches;
      changeListener?.({ matches: nextMatches } as MediaQueryListEvent);
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useReducedMotion', () => {
  it('reads the initial platform preference', () => {
    installMatchMedia(true);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const media = installMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      media.setMatches(true);
    });

    expect(result.current).toBe(true);
  });

  it('removes the media query listener on cleanup', () => {
    const media = installMatchMedia(false);
    const { unmount } = renderHook(() => useReducedMotion());

    expect(media.addEventListener).toHaveBeenCalledTimes(1);

    unmount();

    expect(media.removeEventListener).toHaveBeenCalledTimes(1);
    expect(media.removeEventListener).toHaveBeenCalledWith(
      'change',
      media.addEventListener.mock.calls[0]?.[1],
    );
  });
});
