import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRef, type ReactNode } from 'react';

import { Button } from '@/shared/ui/Button/Button';
import styles from '@/shared/ui/Dialog/Dialog.module.css';

export interface DialogProps {
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
 * Radix의 focus/portal behavior를 사용하는 프로젝트 공용 modal dialog다.
 *
 * CONTRACT: 이 wrapper는 generic modal mechanics만 소유한다.
 * Critical flow는 Escape/outside dismissal을 명시적으로 막을 수 있지만,
 * 모든 Dialog에는 항상 보이는 close control이 남아야 한다.
 *
 * INVARIANT: 중첩 modal focus trap은 Foundation 기본 패턴으로 지원하지 않는다.
 */
export function Dialog({
  children,
  closeLabel,
  closeOnEscape = true,
  closeOnInteractOutside = true,
  description,
  onOpenChange,
  open,
  title,
}: DialogProps) {
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
