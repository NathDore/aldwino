import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/Button";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";
import { CloseIcon } from "@/features/calendar/components/icons";

interface PopoverProps {
  header: ReactNode;
  headerClassName?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
  onClose: () => void;
  children: (handleClose: () => void) => ReactNode;
}

export function Popover({ header, headerClassName, panelClassName, panelStyle, onClose, children }: PopoverProps) {
  const hasClosedRef = useRef(false);
  const mouseDownOnBackdropRef = useRef(false);

  useBodyScrollLock();

  const handleClose = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    onClose();
  }, [onClose]);

  const handleBackdropMouseDown = (e: MouseEvent) => {
    mouseDownOnBackdropRef.current = e.target === e.currentTarget;
  };

  const handleBackdropClick = (e: MouseEvent) => {
    const shouldClose = mouseDownOnBackdropRef.current && e.target === e.currentTarget;
    mouseDownOnBackdropRef.current = false;
    if (!shouldClose) return;
    e.stopPropagation();
    handleClose();
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  const stopClickPropagation = (e: MouseEvent) => e.stopPropagation();
  const stopKeyDownPropagation = (e: ReactKeyboardEvent) => e.stopPropagation();

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
      onKeyDown={stopKeyDownPropagation}
    >
      <div
        className={`flex flex-col bg-white border border-slate-200 rounded-lg shadow-lg ${panelClassName ?? ""}`}
        style={panelStyle}
        onClick={stopClickPropagation}
      >
        <div className={`flex items-start justify-between gap-2 border-b border-slate-200 shrink-0 ${headerClassName ?? "px-6 py-3"}`}>
          {header}
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <span className="sr-only">Close</span>
            <CloseIcon />
          </Button>
        </div>

        {children(handleClose)}
      </div>
    </div>,
    document.body
  );
}
