import { useEffect, useRef } from 'react';

/**
 * Hook providing WCAG-compliant modal dialog accessibility:
 * - Traps Tab / Shift+Tab keyboard focus within the dialog
 * - Listens for Escape key to dismiss dialog
 * - Auto-focuses the first interactive element on open
 * - Restores focus to previous active element upon close
 */
export function useModalAccessibility(isOpen: boolean, onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modalEl = modalRef.current;

    // Focus the first focusable element or modal container
    if (modalEl) {
      const focusables = modalEl.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        modalEl.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalEl) {
        const focusables = Array.from(
          modalEl.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [isOpen, onClose]);

  return modalRef;
}
