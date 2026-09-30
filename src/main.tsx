import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import '@/app/styles/tokens.css';
import '@/shared/motion/motion.css';
import '@/app/styles/global.css';

async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { startDevelopmentRuntime } = await import('@/mocks/startDevelopmentRuntime');
    await startDevelopmentRuntime();
  }

  const rootElement = document.getElementById('root');

  if (rootElement === null) {
    throw new Error('Application root element "#root" is missing.');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
