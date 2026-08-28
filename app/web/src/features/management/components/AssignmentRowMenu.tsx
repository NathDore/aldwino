import { createPortal } from "react-dom";
import { MoreIcon } from "@/features/calendar/components/icons";
import { useAnchoredMenu } from "@/shared/hooks/useAnchoredMenu";

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
  const { isOpen, position, triggerRef, panelRef, toggle, close } = useAnchoredMenu<
    { top: number; left: number },
    HTMLSpanElement,
    HTMLDivElement
  >({
    computePosition: (rect) => ({ top: rect.bottom + 4, left: rect.right }),
  });

  return (
    <>
      <span ref={triggerRef} className="inline-flex">
        <button
          type="button"
          aria-label={`More actions for ${assignmentName}`}
          onClick={toggle}
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
                  close();
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
