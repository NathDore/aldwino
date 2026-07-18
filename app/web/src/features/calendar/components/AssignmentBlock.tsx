import { useEffect, useState } from "react";
import { TaskList } from "./TaskList";
import type { CalendarAssignment } from "../types/calendar.types";

interface AssignmentBlockProps {
  item: CalendarAssignment;
  forceExpanded?: boolean;
}

export function AssignmentBlock({ item, forceExpanded = false }: AssignmentBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { assignment, course, tasks } = item;
  const hasTasks = tasks.length > 0;

  useEffect(() => {
    if (forceExpanded) {
      setIsExpanded(true);
    }
  }, [forceExpanded]);

  return (
    <div className="border-l-2 pl-1.5 py-0.5" style={{ borderLeftColor: course?.color ?? "#cbd5e1" }}>
      <div className="flex items-start justify-between gap-1">
        <p
          className={`text-xs flex-1 min-w-0 ${forceExpanded ? "whitespace-normal break-words" : "truncate"} ${
            assignment.isCompleted ? "line-through text-slate-500" : "text-slate-900"
          }`}
          title={forceExpanded ? undefined : assignment.description}
        >
          {assignment.description}
        </p>
        {hasTasks && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs text-slate-600 hover:text-slate-900 shrink-0"
            aria-label={isExpanded ? "Collapse tasks" : "Expand tasks"}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        )}
      </div>
      {course && <p className="text-[10px] text-slate-600 truncate">{course.code}</p>}
      {hasTasks && isExpanded && <TaskList tasks={tasks} />}
    </div>
  );
}
