import { createPortal } from "react-dom";
import type { CourseDto } from "@/features/courses";
import { formatCourseLabel } from "@/features/courses";
import { Button } from "@/shared/components/Button";
import { ChevronDownIcon } from "@/features/calendar/components/icons";
import { useAnchoredMenu } from "@/shared/hooks/useAnchoredMenu";

interface CourseFilterDropdownProps {
  courses: CourseDto[];
  selectedCourseIds: Set<string>;
  onToggle: (courseId: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function CourseFilterDropdown({
  courses,
  selectedCourseIds,
  onToggle,
  onClear,
  disabled = false,
}: CourseFilterDropdownProps) {
  const { isOpen, position, triggerRef, panelRef, toggle } = useAnchoredMenu<
    { top: number; left: number; width: number },
    HTMLSpanElement,
    HTMLDivElement
  >({
    computePosition: (rect) => ({ top: rect.bottom + 4, left: rect.right, width: rect.width }),
  });

  const selectedCount = selectedCourseIds.size;

  return (
    <>
      <span ref={triggerRef} className="inline-block shrink-0">
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={toggle}
          className="flex items-center gap-1.5"
        >
          Course{selectedCount > 0 ? ` (${selectedCount})` : ""}
          <ChevronDownIcon className="w-3 h-3" />
        </Button>
      </span>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[60] w-56 max-h-64 overflow-y-auto styled-scrollbar bg-white border border-slate-200 rounded-lg shadow-lg py-1"
            style={{ top: position.top, left: position.left, transform: "translateX(-100%)" }}
          >
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
            {courses.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-600">No courses</p>
            ) : (
              courses.map((course) => {
                const checked = selectedCourseIds.has(course.id);
                return (
                  <label
                    key={course.id}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(course.id)}
                      className="shrink-0 cursor-pointer"
                    />
                    <span
                      className="w-3 h-3 shrink-0 rounded-sm border border-slate-400"
                      style={{ backgroundColor: course.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-slate-900">{formatCourseLabel(course)}</span>
                  </label>
                );
              })
            )}
          </div>,
          document.body
        )}
    </>
  );
}
