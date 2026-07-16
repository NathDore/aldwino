import { Button } from "@/shared/components/Button";
import { AssignmentDto } from "@/features/assignments/types/assignment.types";
import { CourseDto } from "@/features/courses/types/course.types";
import { TaskDto } from "../types/task.types";
import { TaskItem } from "./TaskItem";
import { useTaskStore } from "../store/taskStore";

interface TaskAssignmentCardProps {
  assignment: AssignmentDto;
  course: CourseDto | undefined;
  tasks: TaskDto[];
}

export const TaskAssignmentCard = ({
  assignment,
  course,
  tasks,
}: TaskAssignmentCardProps) => {
  const { openFormForNew } = useTaskStore();

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;

  return (
    <div className="space-y-3 rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {course && (
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: course.color }}
              />
            )}
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                {course?.code} - {course?.name}
              </h4>
              <p className="text-sm text-slate-600">
                {assignment.description}
              </p>
            </div>
          </div>
          {assignment.dueDate && (
            <p className="mt-2 text-xs text-slate-600">
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            {completedCount}/{totalCount}
          </div>
          <div className="text-xs text-slate-600">
            tasks
          </div>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => openFormForNew(assignment.id)}
        className="w-full"
      >
        + Add Task
      </Button>
    </div>
  );
};
