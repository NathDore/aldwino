import type { TaskDto } from "@/features/tasks";

interface TaskListProps {
  tasks: TaskDto[];
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <ul className="mt-1 space-y-0.5 pl-2 border-l border-slate-200">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`text-[10px] ${task.isCompleted ? "line-through text-slate-500" : "text-slate-700"}`}
        >
          {task.description}
        </li>
      ))}
    </ul>
  );
}
