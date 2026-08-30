import { useRef, useState, useEffect, type RefObject } from "react";

interface UseAnchoredMenuOptions<TPosition> {
  computePosition: (rect: DOMRect) => TPosition;
}

interface UseAnchoredMenuResult<TTrigger extends HTMLElement, TPanel extends HTMLElement, TPosition> {
  isOpen: boolean;
  position: TPosition;
  triggerRef: RefObject<TTrigger | null>;
  panelRef: RefObject<TPanel | null>;
  toggle: () => void;
  close: () => void;
}

export function useAnchoredMenu<
  TPosition,
  TTrigger extends HTMLElement = HTMLElement,
  TPanel extends HTMLElement = HTMLElement,
>({ computePosition }: UseAnchoredMenuOptions<TPosition>): UseAnchoredMenuResult<TTrigger, TPanel, TPosition> {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<TPosition | null>(null);
  const triggerRef = useRef<TTrigger>(null);
  const panelRef = useRef<TPanel>(null);

  const close = () => setIsOpen(false);

  const toggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPosition(computePosition(rect));
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition(computePosition(rect));
    }

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setIsOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  return { isOpen, position: position as TPosition, triggerRef, panelRef, toggle, close };
}
