import { memo, useEffect, useState, type MouseEvent } from "react";
import { TaskList } from "./TaskList";
import type { CalendarAssignment } from "../types/calendar.types";

interface AssignmentBlockProps {
  item: CalendarAssignment;
  forceExpanded?: boolean;
  autoExpand?: boolean;
  interactive?: boolean;
}

export const AssignmentBlock = memo(function AssignmentBlock({
  item,
  forceExpanded = false,
  autoExpand = false,
  interactive = true,
}: AssignmentBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { assignment, course, tasks } = item;
  const hasTasks = tasks.length > 0;

  useEffect(() => {
    setIsExpanded(forceExpanded && autoExpand);
  }, [forceExpanded]);

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    if (!hasTasks) return;
    setIsExpanded((prev) => !prev);
  };

  const canToggle = interactive && hasTasks;

  if (forceExpanded) {
    return (
      <div
        className={`border border-slate-200 rounded-md p-3${canToggle ? " cursor-pointer" : ""}`}
        onClick={canToggle ? handleToggle : undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div
              className="w-3.5 h-3.5 mt-0.5 shrink-0 rounded-sm border border-slate-400"
              style={{ backgroundColor: course?.color ?? "#cbd5e1" }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {course ? `${course.code} - ${course.title}` : "Unknown course"}
              </p>
              <p
                className={`text-base mt-0.5 whitespace-normal break-words ${assignment.isCompleted ? "line-through text-slate-500" : "text-slate-900"
                  }`}
              >
                {assignment.description}
              </p>
            </div>
          </div>
          {canToggle && (
            <button
              type="button"
              onClick={handleToggle}
              className="text-sm text-slate-600 hover:text-slate-900 shrink-0"
              aria-label={isExpanded ? "Collapse tasks" : "Expand tasks"}
            >
              {isExpanded ? "▾" : "▸"}
            </button>
          )}
        </div>
        {hasTasks && (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
          >
            <div className="overflow-hidden min-h-0">
              <TaskList tasks={tasks} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`border-l-2 pl-1.5 py-0.5${canToggle ? " cursor-pointer" : ""}`}
      style={{ borderLeftColor: course?.color ?? "#cbd5e1" }}
      onClick={canToggle ? handleToggle : undefined}
    >
      <div className="flex items-start justify-between gap-1">
        <p
          className={`text-xs flex-1 min-w-0 truncate ${assignment.isCompleted ? "line-through text-slate-500" : "text-slate-900"
            }`}
          title={assignment.description}
        >
          {assignment.description}
        </p>
        {canToggle && (
          <button
            type="button"
            onClick={handleToggle}
            className="text-xs text-slate-600 hover:text-slate-900 shrink-0"
            aria-label={isExpanded ? "Collapse tasks" : "Expand tasks"}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        )}
      </div>
      {course && <p className="text-[10px] text-slate-600 truncate">{course.code}</p>}
      {hasTasks && (
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
        >
          <div className="overflow-hidden min-h-0">
            <TaskList tasks={tasks} />
          </div>
        </div>
      )}
    </div>
  );
});
