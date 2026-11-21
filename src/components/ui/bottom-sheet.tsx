'use client';

import { X } from 'lucide-react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';

import { cn } from '~/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
  closeLabel?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Modal sheet that slides up from the bottom edge. Handles focus trapping,
 * Escape and outside clicks through react-aria.
 */
export function BottomSheet({
  isOpen,
  onOpenChange,
  title,
  subtitle,
  aside,
  closeLabel = 'Tutup',
  className,
  children,
}: BottomSheetProps) {
  return (
    <ModalOverlay
      isDismissable
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]',
        'data-[entering]:animate-fade-in data-[exiting]:animate-fade-in data-[exiting]:[animation-direction:reverse]',
      )}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Modal
        className={cn(
          'fixed inset-x-0 bottom-0 mx-auto flex max-h-[85svh] w-full max-w-3xl flex-col rounded-t-2xl border-t border-border bg-overlay shadow-2xl outline-none',
          'data-[entering]:animate-sheet-up data-[exiting]:animate-sheet-up data-[exiting]:[animation-direction:reverse]',
          className,
        )}
      >
        <Dialog className="flex min-h-0 flex-1 flex-col outline-none">
          {({ close }) => (
            <>
              <div className="flex justify-center pt-2">
                <span className="h-1 w-10 rounded-full bg-surface-tertiary" />
              </div>

              <div className="flex items-start gap-3 px-4 pb-3 pt-3">
                <div className="min-w-0 flex-1">
                  <Heading className="font-semibold" slot="title">
                    {title}
                  </Heading>
                  {subtitle && (
                    <p className="font-mono text-xs text-muted">{subtitle}</p>
                  )}
                </div>
                {aside}
                <button
                  aria-label={closeLabel}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-soft text-accent hover:bg-amber-soft/70"
                  type="button"
                  onClick={close}
                >
                  <X className="size-4" />
                </button>
              </div>

              {children}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
