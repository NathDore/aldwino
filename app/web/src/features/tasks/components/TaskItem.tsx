import { Button } from "@/shared/components/Button";
import { TaskDto } from "../types/task.types";
import { useTaskStore } from "../store/taskStore";
import { useUpdateTaskMutation, useDeleteTaskMutation } from "../queries/useTaskMutations";

interface TaskItemProps {
  task: TaskDto;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  const { openFormForEdit, setShowDeleteConfirm } = useTaskStore();
  const updateTaskMutation = useUpdateTaskMutation();

  const handleToggleComplete = async () => {
    await updateTaskMutation.mutateAsync({
      id: task.id,
      data: {
        assignmentId: task.assignmentId,
        description: task.description,
        isCompleted: !task.isCompleted,
      },
    });
  };

  const handleEdit = () => {
    openFormForEdit(task.id);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true, task.id);
  };

  return (
    <div
      className={`flex items-center gap-3 rounded border p-3 transition-all ${
        task.isCompleted
          ? "border-slate-200 bg-slate-50 opacity-60"
          : "border-slate-200 bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={handleToggleComplete}
        disabled={updateTaskMutation.isPending}
        className="w-4 h-4 accent-emerald-600 cursor-pointer disabled:opacity-50"
        aria-label="Toggle task completion"
      />

      <span
        className={`flex-1 text-sm ${
          task.isCompleted
            ? "line-through text-slate-600"
            : "text-slate-900"
        }`}
      >
        {task.description}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
