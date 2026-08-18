import { useMemo, useState } from "react";
import { useAssignmentsQuery, isAssignmentCompleted, isAssignmentOverdue, getAssignmentColor } from "@/features/assignments";
import type { AssignmentDto } from "@/features/assignments";
import { useCoursesQuery } from "@/features/courses";
import { CourseFilterDropdown } from "@/features/courses/components/CourseFilterDropdown";
import { Button } from "@/shared/components/Button";
import { PlusIcon } from "@/features/calendar/components/icons";
import { LABEL_FONT_SIZE, ONE_LINE_TEXT_INPUT_HEIGHT } from "@/shared/lib/formConstants";

interface AssignmentLinkSelectorProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onRequestCreateAssignment: () => void;
  excludeIds?: Set<string>;
  disabled?: boolean;
  optional?: boolean;
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function matchesSearch(assignment: AssignmentDto, query: string): boolean {
  return assignment.name.toLowerCase().includes(query.toLowerCase());
}

export function AssignmentLinkSelector({
  selectedIds,
  onToggle,
  onRequestCreateAssignment,
  excludeIds,
  disabled = false,
  optional = false,
}: AssignmentLinkSelectorProps) {
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const [search, setSearch] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());

  const coursesById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const clearCourses = () => setSelectedCourseIds(new Set());

  const inProgress = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          !isAssignmentCompleted(assignment) && !isAssignmentOverdue(assignment) && !excludeIds?.has(assignment.id)
      ),
    [assignments, excludeIds]
  );

  const visible = useMemo(
    () =>
      inProgress
        .filter((assignment) => search.trim() === "" || matchesSearch(assignment, search))
        .filter((assignment) => selectedCourseIds.size === 0 || selectedCourseIds.has(assignment.courseId)),
    [inProgress, search, selectedCourseIds]
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-baseline justify-between mb-1.5 shrink-0">
        <label className={`${LABEL_FONT_SIZE} font-semibold text-slate-700`}>
          Add assignments{optional ? " (optional)" : ""}
        </label>
        <Button variant="ghost" size="sm" onClick={onRequestCreateAssignment} disabled={disabled}>
          <span className="flex items-center gap-1">
            <PlusIcon className="w-3 h-3" />
            New Assignment
          </span>
        </Button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assignments…"
          disabled={disabled || inProgress.length === 0}
          className={`flex-1 min-w-0 ${ONE_LINE_TEXT_INPUT_HEIGHT} px-3 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-600 disabled:opacity-50`}
        />
        <CourseFilterDropdown
          courses={courses}
          selectedCourseIds={selectedCourseIds}
          onToggle={toggleCourse}
          onClear={clearCourses}
          disabled={disabled || inProgress.length === 0}
        />
      </div>

      <div className="mt-2 flex-1 min-h-0 max-h-[280px] overflow-y-auto styled-scrollbar border border-slate-200 rounded-lg divide-y divide-slate-100">
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
