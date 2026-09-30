import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/app/styles/tokens.css';
import '@/shared/motion/motion.css';
import '@/app/styles/global.css';
import { ImageReveal, SectionReveal } from '@/shared/motion';

function MotionFixture() {
  return (
    <main>
      <div aria-hidden="true" style={{ blockSize: '110vh' }} />

      <SectionReveal>
        <section data-testid="section-reveal" style={{ minBlockSize: '180px' }}>
          <h1>Section reveal fixture</h1>
        </section>
      </SectionReveal>

      <div aria-hidden="true" style={{ blockSize: '40vh' }} />

      <ImageReveal>
        <div data-testid="image-reveal" style={{ minBlockSize: '240px' }}>
          Image reveal fixture
        </div>
      </ImageReveal>

      <div aria-hidden="true" style={{ blockSize: '100vh' }} />
    </main>
  );
}

const rootElement = document.getElementById('motion-fixture-root');

if (rootElement === null) {
  throw new Error('Motion fixture root is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <MotionFixture />
  </StrictMode>,
);
