import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/app/styles/tokens.css';
import '@/shared/motion/motion.css';
import '@/app/styles/global.css';
import { BottomSheet, Button, Dialog } from '@/shared/ui';

function OverlayFixture() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <main
      style={{
        display: 'grid',
        gap: '16px',
        maxWidth: '640px',
        padding: '24px',
      }}
    >
      <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
      <Button onClick={() => setSheetOpen(true)}>Open sheet</Button>

      <Dialog
        closeLabel="Close dialog"
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="E2E dialog"
      >
        <p>Foundation dialog viewport probe.</p>
      </Dialog>

      <BottomSheet
        closeLabel="Close sheet"
        onOpenChange={setSheetOpen}
        open={sheetOpen}
        title="E2E sheet"
      >
        <p>Foundation bottom sheet viewport probe.</p>
      </BottomSheet>
    </main>
  );
}

const rootElement = document.getElementById('fixture-root');

if (rootElement === null) {
  throw new Error('Overlay fixture root is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <OverlayFixture />
  </StrictMode>,
);
