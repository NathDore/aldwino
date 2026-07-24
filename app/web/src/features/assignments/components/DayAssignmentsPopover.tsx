import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/Button";
import { AssignmentChip } from "./AssignmentChip";
import { useAssignmentStore } from "../store/assignmentStore";
import type { AssignmentDayGroup } from "../hooks/useAssignmentDayGroups";
import type { CourseDto } from "@/features/courses";

const EXIT_TRANSITION_MS = 150;
const EXIT_SAFETY_MARGIN_MS = 100;

interface DayAssignmentsPopoverProps {
  dayGroup: AssignmentDayGroup;
  courses: CourseDto[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
    </svg>
  );
}

export function DayAssignmentsPopover({ dayGroup, courses, onClose, onDelete }: DayAssignmentsPopoverProps) {
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const selectedAssignmentId = useAssignmentStore((state) => state.selectedAssignmentId);
  const assignmentIdPendingDelete = useAssignmentStore((state) => state.assignmentIdPendingDelete);
  const [isVisible, setIsVisible] = useState(false);
  const hasClosedRef = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const closeNow = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    window.setTimeout(closeNow, EXIT_TRANSITION_MS + EXIT_SAFETY_MARGIN_MS);
  }, [closeNow]);

  useEffect(() => {
    if (selectedAssignmentId || assignmentIdPendingDelete) {
      handleClose();
    }
  }, [selectedAssignmentId, assignmentIdPendingDelete, handleClose]);

  const handleBackdropClick = (e: MouseEvent) => {
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

  return createPortal(
    <div
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 transition-opacity duration-150 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`flex flex-col w-96 max-w-full max-h-[80vh] bg-white border border-slate-200 rounded-lg shadow-lg transition-[opacity,transform] duration-150 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={stopClickPropagation}
        onTransitionEnd={(e) => {
          if (!isVisible && e.propertyName === "opacity") closeNow();
        }}
      >
        <div className="flex items-start justify-between gap-2 px-6 pt-6 pb-4 border-b border-slate-200 shrink-0">
          <p className="text-lg font-bold text-slate-900 truncate">{dayGroup.fullDayLabel}</p>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <span className="sr-only">Close</span>
            <CloseIcon />
          </Button>
        </div>

        <div className="space-y-2 px-6 py-4 overflow-y-auto min-h-0">
          {dayGroup.assignments.map((assignment) => (
            <AssignmentChip
              key={assignment.id}
              assignment={assignment}
              course={coursesById.get(assignment.courseId)}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
