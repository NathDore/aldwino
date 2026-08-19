import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useChangeAssignmentStateMutation } from "../queries/useMutations";
import { useAssignmentStatesQuery } from "../queries/useAssignmentStatesQuery";
import { Button } from "@/shared/components/Button";
import { ChevronDownIcon, MoreIcon } from "@/features/calendar/components/icons";
import { EditAssignmentModal } from "./EditAssignmentModal";
import {
  getCourseColor,
  getAssignmentStatusBackgroundClass,
  isAssignmentCompleted,
  isAssignmentOverdue,
  getAssignmentStateId,
} from "../utils/assignmentStatus";
import type { CalendarAssignment } from "@/features/calendar/types/calendar.types";
import { formatCourseLabel } from "@/features/courses";

interface AssignmentPopoverItemProps {
  item: CalendarAssignment;
  onUnlink: () => void;
  isUnlinking?: boolean;
  unlinkDisabled?: boolean;
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const AssignmentPopoverItem = memo(function AssignmentPopoverItem({
  item,
  onUnlink,
  isUnlinking = false,
  unlinkDisabled = false,
}: AssignmentPopoverItemProps) {
  const { assignment, course } = item;
  const { data: assignmentStates } = useAssignmentStatesQuery();
  const stateMutation = useChangeAssignmentStateMutation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuTriggerRef = useRef<HTMLSpanElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const borderColor = getCourseColor(course);
  const isOverdue = isAssignmentOverdue(assignment);
  const completed = isAssignmentCompleted(assignment);
  const isCollapsed = completed && !isExpanded;
  const statusBg = getAssignmentStatusBackgroundClass(assignment);

  const handleToggleComplete = async () => {
    const targetStateId = getAssignmentStateId(assignmentStates, completed ? "UNCOMPLETED" : "COMPLETED");
    if (!targetStateId) return;
    await stateMutation.mutateAsync({ id: assignment.id, assignmentStateId: targetStateId });
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    function updatePosition() {
      const rect = menuTriggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({ top: rect.bottom + 4, left: rect.right });
    }

    updatePosition();

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (menuPanelRef.current?.contains(target) || menuTriggerRef.current?.contains(target)) return;
      setIsMenuOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
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
  }, [isMenuOpen]);

  return (
    <div
      className={`border border-slate-200 rounded-md ${isCollapsed ? "py-1.5 px-3" : "p-3"} ${statusBg} ${completed ? "opacity-50" : ""}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-3.5 h-3.5 mt-0.5 shrink-0 rounded-sm border border-slate-400"
          style={{ backgroundColor: borderColor }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          {isCollapsed ? (
            <p className="text-sm text-slate-700 truncate line-through">
              {course ? `${course.code} - ` : ""}
              {assignment.name}
            </p>
          ) : (
            <>
              <p className={`text-sm font-semibold text-slate-700 truncate ${completed ? "line-through" : ""}`}>
                {course ? formatCourseLabel(course) : "Unknown course"}
              </p>
              <p className={`text-base mt-0.5 whitespace-normal break-words text-slate-900 ${completed ? "line-through" : ""}`}>
                {assignment.name}
              </p>
              <p className={`text-xs mt-1.5 ${isOverdue ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                Due {formatDueDate(assignment.dueDate)}
              </p>
            </>
          )}
        </div>
        {completed && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded((v) => !v)} className="shrink-0">
            <span className="sr-only">{isExpanded ? "Collapse assignment details" : "Expand assignment details"}</span>
            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        )}
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggleComplete}
            disabled={stateMutation.isPending || isUnlinking || unlinkDisabled}
            className="cursor-pointer disabled:cursor-not-allowed"
            aria-label={`Mark ${assignment.name} as ${completed ? "incomplete" : "complete"}`}
          />
          <span ref={menuTriggerRef} className="inline-flex">
            <Button variant="ghost" size="xs" onClick={() => {
              if (isUnlinking || unlinkDisabled) return;
              setIsMenuOpen((v) => !v)
            }}>
              <span className="sr-only">More actions for {assignment.name}</span>
              <MoreIcon className="w-3.5 h-3.5" />
            </Button>
          </span>
        </div>
        {isMenuOpen &&
          createPortal(
            <div
              ref={menuPanelRef}
              className="fixed z-[60] w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1"
              style={{ top: menuPosition.top, left: menuPosition.left, transform: "translateX(-100%)" }}
            >
              <button
                type="button"
                onClick={() => {
                  if (isUnlinking || unlinkDisabled) return;
                  setIsMenuOpen(false);
                  setIsEditing(true);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isUnlinking || unlinkDisabled) return;
                  setIsMenuOpen(false);
                  onUnlink();
                }}
                disabled={isUnlinking || unlinkDisabled}
                className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </div>,
            document.body
          )}
      </div>
      {isEditing && <EditAssignmentModal item={item} onClose={() => setIsEditing(false)} />}
    </div>
  );
});
