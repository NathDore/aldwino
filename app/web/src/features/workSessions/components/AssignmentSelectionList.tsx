import { useMemo, useState } from "react";
import { useAssignmentsQuery, isAssignmentCompleted, isAssignmentOverdue, getAssignmentColor } from "@/features/assignments";
import type { AssignmentDto } from "@/features/assignments";
import { useCoursesQuery } from "@/features/courses";
import type { CourseDto } from "@/features/courses";

interface AssignmentSelectionListProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function matchesSearch(assignment: AssignmentDto, course: CourseDto | undefined, query: string): boolean {
  const haystack = `${assignment.name} ${course?.code ?? ""} ${course?.title ?? ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function AssignmentSelectionList({ selectedIds, onToggle, disabled = false }: AssignmentSelectionListProps) {
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const [search, setSearch] = useState("");

  const coursesById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  const inProgress = useMemo(
    () => assignments.filter((assignment) => !isAssignmentCompleted(assignment) && !isAssignmentOverdue(assignment)),
    [assignments]
  );

  const visible = useMemo(
    () =>
      search.trim() === ""
        ? inProgress
        : inProgress.filter((assignment) => matchesSearch(assignment, coursesById.get(assignment.courseId), search)),
    [inProgress, coursesById, search]
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search assignments…"
        disabled={disabled || inProgress.length === 0}
        className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-600 disabled:opacity-50 shrink-0"
      />

      <div className="mt-2 flex-1 min-h-0 max-h-[420px] overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-sm text-slate-600 text-center">
            {inProgress.length === 0 ? "No assignments in progress" : "No matches"}
          </p>
        ) : (
          visible.map((assignment) => {
            const course = coursesById.get(assignment.courseId);
            const checked = selectedIds.has(assignment.id);
            return (
              <label
                key={assignment.id}
                className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(assignment.id)}
                  disabled={disabled}
                  className="shrink-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <span
                  className="w-3 h-3 shrink-0 rounded-sm border border-slate-400"
                  style={{ backgroundColor: getAssignmentColor(assignment, course) }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-slate-900">{assignment.name}</span>
                <span className="shrink-0 text-xs text-slate-600">Due {formatDueDate(assignment.dueDate)}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
