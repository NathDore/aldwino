import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";
import { useAssignmentStore } from "../store/assignmentStore";
import { useUpdateAssignmentMutation } from "../queries/useMutations";
import { Button } from "@/shared/components/Button";

interface AssignmentChipProps {
  assignment: AssignmentDto;
  course: CourseDto | undefined;
  onDelete: (id: string) => void;
}

export function AssignmentChip({ assignment, course, onDelete }: AssignmentChipProps) {
  const { openFormForEdit } = useAssignmentStore();
  const updateMutation = useUpdateAssignmentMutation();

  const handleToggleComplete = () => {
    updateMutation.mutate({
      id: assignment.id,
      data: {
        courseId: assignment.courseId,
        description: assignment.description,
        dueDate: assignment.dueDate,
        startTime: assignment.startTime,
        expectedDurationMinutes: assignment.expectedDurationMinutes,
        isCompleted: !assignment.isCompleted,
      },
    });
  };

  return (
    <div className="flex items-start justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
      <div className="flex items-start gap-3 min-w-0">
        <input
          type="checkbox"
          checked={assignment.isCompleted}
          onChange={handleToggleComplete}
          disabled={updateMutation.isPending}
          className="mt-1 w-4 h-4 accent-emerald-600 cursor-pointer disabled:opacity-50"
          aria-label={assignment.isCompleted ? "Mark as incomplete" : "Mark as complete"}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 shrink-0 border border-slate-400"
              style={{ backgroundColor: course?.color ?? "#cbd5e1" }}
            />
            <span className="text-xs font-semibold text-slate-700 truncate">
              {course ? `${course.code} - ${course.title}` : "Unknown course"}
            </span>
          </div>
          <p
            className={`text-sm ${
              assignment.isCompleted ? "line-through text-slate-500" : "text-slate-900"
            }`}
          >
            {assignment.description}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Due{" "}
            {new Date(assignment.dueDate).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="secondary" size="sm" onClick={() => openFormForEdit(assignment.id)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(assignment.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
