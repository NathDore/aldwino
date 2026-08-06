import { memo, useState } from "react";
import { useChangeAssignmentStateMutation, useDeleteAssignmentMutation } from "../queries/useMutations";
import { useAssignmentStatesQuery } from "../queries/useAssignmentStatesQuery";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { ChevronDownIcon, PencilIcon, TrashIcon, UnlinkIcon } from "@/features/calendar/components/icons";
import { EditAssignmentModal } from "./EditAssignmentModal";
import { getAssignmentColor, isAssignmentCompleted, isAssignmentOverdue, getAssignmentStateId } from "../utils/assignmentStatus";
import type { CalendarAssignment } from "@/features/calendar/types/calendar.types";
import { formatCourseLabel } from "@/features/courses";

interface AssignmentPopoverItemProps {
  item: CalendarAssignment;
  onUnlink: () => void;
  isUnlinking?: boolean;
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
}: AssignmentPopoverItemProps) {
  const { assignment, course } = item;
  const { data: assignmentStates } = useAssignmentStatesQuery();
  const stateMutation = useChangeAssignmentStateMutation();
  const deleteMutation = useDeleteAssignmentMutation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const borderColor = getAssignmentColor(assignment, course);
  const isOverdue = isAssignmentOverdue(assignment);
  const completed = isAssignmentCompleted(assignment);
  const isCollapsed = completed && !isExpanded;

  const handleToggleComplete = async () => {
    const targetStateId = getAssignmentStateId(assignmentStates, completed ? "UNCOMPLETED" : "COMPLETED");
    if (!targetStateId) return;
    await stateMutation.mutateAsync({ id: assignment.id, assignmentStateId: targetStateId });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(assignment.id);
    setIsConfirmingDelete(false);
  };

  return (
    <div
      className={`border border-slate-200 rounded-md ${isCollapsed ? "py-1.5 px-3" : "p-3"} ${completed ? "opacity-50" : ""}`}
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
              <p className={`text-xs mt-1.5 ${isOverdue ? "text-amber-600 font-semibold" : "text-slate-600"}`}>
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
        <Button variant="ghost" size="sm" onClick={onUnlink} disabled={isUnlinking} className="shrink-0">
          <span className="sr-only">Unlink {assignment.name} from this work session</span>
          <UnlinkIcon />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="shrink-0">
          <span className="sr-only">Edit {assignment.name}</span>
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsConfirmingDelete(true)}
          disabled={deleteMutation.isPending}
          className="shrink-0"
        >
          <span className="sr-only">Delete {assignment.name}</span>
          <TrashIcon />
        </Button>
        <input
          type="checkbox"
          checked={completed}
          onChange={handleToggleComplete}
          disabled={stateMutation.isPending}
          className="mt-1 cursor-pointer shrink-0 disabled:cursor-not-allowed"
          aria-label={`Mark ${assignment.name} as ${completed ? "incomplete" : "complete"}`}
        />
      </div>
      {isEditing && <EditAssignmentModal item={item} onClose={() => setIsEditing(false)} />}
      {isConfirmingDelete && (
        <Modal maxWidth="max-w-md">
          <DeleteConfirmation
            title="Delete assignment"
            description={`This will permanently delete "${assignment.name}".`}
            isLoading={deleteMutation.isPending}
            onConfirm={handleDelete}
            onCancel={() => setIsConfirmingDelete(false)}
          />
        </Modal>
      )}
    </div>
  );
});
