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
 * Dialog와 동일한 Radix modal behavior를 사용하는 bottom-anchored surface다.
 *
 * CONTRACT: 이 Component는 배치와 scrolling만 바꾼다.
 * focus, dismissal, accessible modal semantics는 Dialog와 동일하게 유지한다.
 *
 * INVARIANT: 중첩 modal focus trap은 Foundation 기본 패턴으로 지원하지 않는다.
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
