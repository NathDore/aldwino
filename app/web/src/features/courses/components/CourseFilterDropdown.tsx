import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CourseDto } from "@/features/courses";
import { formatCourseLabel } from "@/features/courses";
import { Button } from "@/shared/components/Button";
import { ChevronDownIcon } from "@/features/calendar/components/icons";

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
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedCount = selectedCourseIds.size;

  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.bottom + 4, left: rect.right, width: rect.width });
    }

    updatePosition();

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setIsOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <span ref={triggerRef} className="inline-block shrink-0">
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => setIsOpen((v) => !v)}
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
