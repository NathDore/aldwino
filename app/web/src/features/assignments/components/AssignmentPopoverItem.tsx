import { memo, useState } from "react";
import {
  useCompleteAssignmentMutation,
  useDeleteAssignmentMutation,
} from "../queries/useMutations";
import { Button } from "@/shared/components/Button";
import { ChevronDownIcon, PencilIcon, TrashIcon } from "@/features/calendar/components/icons";
import { EditAssignmentModal } from "./EditAssignmentModal";
import type { CalendarAssignment } from "@/features/calendar/types/calendar.types";
import { formatCourseLabel } from "@/features/courses";

interface AssignmentPopoverItemProps {
  item: CalendarAssignment;
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const AssignmentPopoverItem = memo(function AssignmentPopoverItem({ item }: AssignmentPopoverItemProps) {
  const { assignment, course } = item;
  const mutation = useCompleteAssignmentMutation();
  const deleteMutation = useDeleteAssignmentMutation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const borderColor = assignment.isCompleted ? "#10b981" : (course?.color ?? "#cbd5e1");
  const isCollapsed = assignment.isCompleted && !isExpanded;

  const handleToggleComplete = async () => {
    await mutation.mutateAsync({
      id: assignment.id,
      isCompleted: !assignment.isCompleted,
    });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(assignment.id);
  };

  return (
    <div
      className={`border border-slate-200 rounded-md ${isCollapsed ? "py-1.5 px-3" : "p-3"} ${assignment.isCompleted ? "opacity-50" : ""}`}
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
              {assignment.description}
            </p>
          ) : (
            <>
              <p className={`text-sm font-semibold text-slate-700 truncate ${assignment.isCompleted ? "line-through" : ""}`}>
                {course ? formatCourseLabel(course) : "Unknown course"}
              </p>
              <p className={`text-base mt-0.5 whitespace-normal break-words text-slate-900 ${assignment.isCompleted ? "line-through" : ""}`}>
                {assignment.description}
              </p>
              {!assignment.isCompleted && (
                <p className="text-xs text-slate-600 mt-1.5">
                  {assignment.expectedDurationMinutes} min • Due {formatDueDate(assignment.dueDate)}
                </p>
              )}
            </>
          )}
        </div>
        {assignment.isCompleted && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded((v) => !v)} className="shrink-0">
            <span className="sr-only">{isExpanded ? "Collapse assignment details" : "Expand assignment details"}</span>
            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        )}
        {assignment.isCompleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="shrink-0"
          >
            <span className="sr-only">Delete {assignment.description}</span>
            <TrashIcon />
          </Button>
        )}
        {!assignment.isCompleted && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="shrink-0">
            <span className="sr-only">Edit {assignment.description}</span>
            <PencilIcon />
          </Button>
        )}
        <input
          type="checkbox"
          checked={assignment.isCompleted}
          onChange={handleToggleComplete}
          disabled={mutation.isPending}
          className="mt-1 cursor-pointer shrink-0"
          aria-label={`Mark ${assignment.description} as ${assignment.isCompleted ? "incomplete" : "complete"}`}
        />
      </div>
      {isEditing && <EditAssignmentModal item={item} onClose={() => setIsEditing(false)} />}
    </div>
  );
});
