import type { CourseDto } from "@/features/courses";
import { Button } from "@/shared/components/Button";
import { PlusIcon } from "@/features/calendar/components/icons";
import type { AssignmentStatusFilterValue } from "../utils/assignmentGrouping";
import { AssignmentStatusFilterPills } from "./AssignmentStatusFilterPills";

interface AssignmentFilterBarProps {
  courses: CourseDto[];
  courseFilterIds: Set<string>;
  onToggleCourseFilter: (id: string) => void;
  statusFilter: Set<AssignmentStatusFilterValue>;
  onToggleStatusFilter: (value: AssignmentStatusFilterValue) => void;
  onAddClick: () => void;
}

export function AssignmentFilterBar({
  courses,
  courseFilterIds,
  onToggleCourseFilter,
  statusFilter,
  onToggleStatusFilter,
  onAddClick,
}: AssignmentFilterBarProps) {
  return (
    <div className="shrink-0 flex justify-between items-center flex-wrap gap-2.5 mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {courses.map((course) => {
            const active = courseFilterIds.has(course.id);
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onToggleCourseFilter(course.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? "text-slate-900" : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                style={active ? { borderColor: course.color, backgroundColor: `${course.color}1a` } : undefined}
              >
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: course.color }}
                  aria-hidden="true"
                />
                {course.code}
              </button>
            );
          })}
        </div>
        <AssignmentStatusFilterPills value={statusFilter} onToggle={onToggleStatusFilter} />
      </div>
      <Button variant="secondary" size="sm" onClick={onAddClick} className="flex items-center gap-1.5 shrink-0">
        <PlusIcon className="w-3.5 h-3.5" />
        Add assignment
      </Button>
    </div>
  );
}
