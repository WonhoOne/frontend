// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ImageReveal, SectionReveal } from '@/shared/motion/Reveal';

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

let observerCallback: ObserverCallback | null = null;
const disconnect = vi.fn();

class IntersectionObserverStub {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = (entries) => {
      callback(entries, this);
    };
  }

  disconnect = disconnect;
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
  root = null;
  rootMargin = '0px';
  thresholds = [0.15];
}

afterEach(() => {
  observerCallback = null;
  disconnect.mockClear();
  vi.unstubAllGlobals();
});

describe('Reveal helpers', () => {
  it('reveals a section once when it enters the viewport', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

    render(
      <SectionReveal>
        <p>Section content</p>
      </SectionReveal>,
    );

    const root = screen.getByText('Section content').parentElement;

    expect(root).toHaveAttribute('data-revealed', 'false');

    act(() => {
      observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(root).toHaveAttribute('data-revealed', 'true');
    expect(disconnect).toHaveBeenCalled();
  });

  it('reveals immediately when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(
      <ImageReveal>
        <div>Image content</div>
      </ImageReveal>,
    );

    expect(screen.getByText('Image content').parentElement).toHaveAttribute(
      'data-revealed',
      'true',
    );
  });
});
