import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreIcon } from "@/features/calendar/components/icons";

export interface AssignmentRowMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface AssignmentRowMenuProps {
  assignmentName: string;
  items: AssignmentRowMenuItem[];
}

export function AssignmentRowMenu({ assignmentName, items }: AssignmentRowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.bottom + 4, left: rect.right });
    }

    updatePosition();

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

  return (
    <>
      <span ref={triggerRef} className="inline-flex">
        <button
          type="button"
          aria-label={`More actions for ${assignmentName}`}
          onClick={() => setIsOpen((v) => !v)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
        >
          <MoreIcon />
        </button>
      </span>
      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[60] w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1"
            style={{ top: position.top, left: position.left, transform: "translateX(-100%)" }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`w-full text-left px-3 py-1.5 text-sm ${item.variant === "danger" ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
