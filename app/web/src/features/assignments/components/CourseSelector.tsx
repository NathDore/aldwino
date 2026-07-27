import type { CourseDto } from "@/features/courses";

interface CourseSelectorProps {
  courses: CourseDto[];
  selectedCourseId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function CourseSelector({ courses, selectedCourseId, onSelect, disabled = false }: CourseSelectorProps) {
  return (
    <div className="grid max-h-36 grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2 overflow-y-auto p-0.5">
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
            className={`flex flex-col items-center gap-1 rounded border p-1.5 transition-colors disabled:opacity-50 ${
              isSelected ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-slate-400 text-sm font-semibold text-white"
              style={{ backgroundColor: course.color }}
            >
              {letter}
            </div>
            <span
              className={`w-full truncate text-center text-[10px] leading-tight ${
                isSelected ? "font-medium text-emerald-700" : "text-slate-600"
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
