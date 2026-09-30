import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRef, type ReactNode } from 'react';

import { Button } from '@/shared/ui/Button/Button';
import styles from '@/shared/ui/BottomSheet/BottomSheet.module.css';

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  closeLabel: string;
  closeOnEscape?: boolean;
  closeOnInteractOutside?: boolean;
}

/**
 * Bottom-anchored modal surface using the same Radix dialog behavior as Dialog.
 *
 * CONTRACT: This component changes placement and scrolling only. Focus,
 * dismissal, and accessible modal semantics stay aligned with Dialog.
 *
 * INVARIANT: Nested modal focus traps are not a supported Foundation pattern.
 */
export function BottomSheet({
  children,
  closeLabel,
  closeOnEscape = true,
  closeOnInteractOutside = true,
  description,
  onOpenChange,
  open,
  title,
}: BottomSheetProps) {
  const descriptionProps = description === undefined ? { 'aria-describedby': undefined } : {};
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content
          {...descriptionProps}
          className={styles.content}
          onCloseAutoFocus={(event) => {
            const returnTarget = returnFocusRef.current;
            returnFocusRef.current = null;

            if (returnTarget?.isConnected) {
              event.preventDefault();
              returnTarget.focus();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (!closeOnEscape) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (!closeOnInteractOutside) {
              event.preventDefault();
            }
          }}
          onOpenAutoFocus={() => {
            const activeElement = document.activeElement;

            if (activeElement instanceof HTMLElement) {
              returnFocusRef.current = activeElement;
            }
          }}
        >
          <div aria-hidden="true" className={styles.handle} />

          <header className={styles.header}>
            <div className={styles.heading}>
              <DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
              {description !== undefined ? (
                <DialogPrimitive.Description className={styles.description}>
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>

            <DialogPrimitive.Close asChild>
              <Button size="small" variant="quiet">
                {closeLabel}
              </Button>
            </DialogPrimitive.Close>
          </header>

          <div className={styles.body}>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
