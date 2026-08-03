import type { CourseDto } from "../types/course.types";
import { PlusIcon } from "@/features/calendar/components/icons";

interface CourseSelectorProps {
  courses: CourseDto[];
  selectedCourseId: string;
  onSelect: (id: string) => void;
  onRequestCreateCourse?: () => void;
  disabled?: boolean;
}

export function CourseSelector({
  courses,
  selectedCourseId,
  onSelect,
  onRequestCreateCourse,
  disabled = false,
}: CourseSelectorProps) {
  return (
    <div className="grid max-h-26 grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-1.5 overflow-y-auto p-0.5 styled-scrollbar">
      {onRequestCreateCourse && (
        <button
          type="button"
          onClick={onRequestCreateCourse}
          disabled={disabled}
          title="Create a new course"
          className="flex flex-col items-center gap-0.5 rounded border border-dashed border-slate-300 p-1 text-slate-500 transition-colors hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-dashed border-slate-400">
            <PlusIcon className="w-3 h-3" />
          </div>
          <span className="w-full truncate text-center text-[9px] leading-tight">New</span>
        </button>
      )}
      {courses.map((course) => {
        const isSelected = course.id === selectedCourseId;
        const letter = course.code.charAt(0).toUpperCase();

        return (
          <button
            key={course.id}
            type="button"
            onClick={() => onSelect(course.id)}
            disabled={disabled}
            title={`${course.code} - ${course.title}`}
            className={`flex flex-col items-center gap-0.5 rounded border p-1 transition-colors disabled:opacity-50 ${isSelected ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
          >
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-slate-400 text-xs font-semibold text-white"
              style={{ backgroundColor: course.color }}
            >
              {letter}
            </div>
            <span
              className={`w-full truncate text-center text-[9px] leading-tight ${isSelected ? "font-medium text-emerald-700" : "text-slate-600"
                }`}
            >
              {course.code}
            </span>
          </button>
        );
      })}
    </div>
  );
}
