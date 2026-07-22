import { memo } from "react";
import type { TaskDto } from "@/features/tasks";

interface TaskListProps {
  tasks: TaskDto[];
}

// Only ever mounted when forceExpanded (inside EventPopover); if EventBlock's
// compact preview ever enables task expansion, this styling will need a compact variant.
export const TaskList = memo(function TaskList({ tasks }: TaskListProps) {
  return (
    <ul className="mt-2 space-y-1 pl-2 border-l border-slate-200">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-2">
          <span
            className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${task.isCompleted ? "bg-slate-400" : "bg-slate-600"}`}
            aria-hidden="true"
          />
          <span className={`text-sm ${task.isCompleted ? "line-through text-slate-500" : "text-slate-700"}`}>
            {task.description}
          </span>
        </li>
      ))}
    </ul>
  );
});
