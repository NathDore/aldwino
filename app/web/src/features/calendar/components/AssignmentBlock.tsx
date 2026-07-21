import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { TaskList } from "./TaskList";
import { createRAFDebounce } from "../utils/createRAFDebounce";
import type { CalendarAssignment } from "../types/calendar.types";

interface AssignmentBlockProps {
  item: CalendarAssignment;
  forceExpanded?: boolean;
  autoExpand?: boolean;
  onToggle?: () => void;
  isParentExpanded?: boolean;
}

export function AssignmentBlock({ item, forceExpanded = false, autoExpand = false, onToggle, isParentExpanded }: AssignmentBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskListHeight, setTaskListHeight] = useState(0);
  const taskListRef = useRef<HTMLDivElement>(null);
  const { assignment, course, tasks } = item;
  const hasTasks = tasks.length > 0;

  useEffect(() => {
    setIsExpanded(forceExpanded && autoExpand);
  }, [forceExpanded]);

  useLayoutEffect(() => {
    if (!hasTasks) return;
    const el = taskListRef.current;
    if (!el) return;

    const measure = () => setTaskListHeight(el.scrollHeight);
    const { debounced: debouncedMeasure, cancel } = createRAFDebounce(measure);

    measure();

    const observer = new ResizeObserver(() => debouncedMeasure());
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancel();
    };
  }, [hasTasks]);

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    if (!hasTasks) return;
    onToggle?.();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`border-l-2 pl-1.5 py-0.5${hasTasks ? " cursor-pointer" : ""}`}
      style={{ borderLeftColor: course?.color ?? "#cbd5e1" }}
      onClick={hasTasks ? handleToggle : undefined}
    >
      <div className="flex items-start justify-between gap-1">
        <p
          className={`text-xs flex-1 min-w-0 ${forceExpanded ? "whitespace-normal break-words" : "truncate"} ${assignment.isCompleted ? "line-through text-slate-500" : "text-slate-900"
            }`}
          title={forceExpanded ? undefined : assignment.description}
        >
          {assignment.description}
        </p>
        {hasTasks && (
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
          ref={taskListRef}
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ height: isExpanded ? taskListHeight : 0 }}
        >
          <TaskList tasks={tasks} />
        </div>
      )}
    </div>
  );
}
