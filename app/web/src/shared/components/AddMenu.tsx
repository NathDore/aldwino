import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { Popover } from "./Popover";
import { CourseIcon, WorkSessionIcon } from "./icons";
import { PlusIcon, ChevronDownIcon } from "@/features/calendar/components/icons";
import { CreateAssignmentForm } from "@/features/assignments/components/CreateAssignmentForm";
import { InlineCourseForm } from "@/features/courses/components/InlineCourseForm";
import { CreateWorkSessionPopover } from "@/features/workSessions/components/CreateWorkSessionPopover";
import { MODAL_HEIGHT, MODAL_WIDTH } from "@/shared/lib/formConstants";
import { toISODate } from "@/features/calendar/hooks/useWeekDays";

type ActiveForm = "assignment" | "course" | "workSession" | null;

export function AddMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
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

  const openForm = (form: ActiveForm) => {
    setIsOpen(false);
    setActiveForm(form);
  };

  const closeForm = () => setActiveForm(null);

  return (
    <>
      <span ref={triggerRef} className="inline-block shrink-0">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-1.5"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add
          <ChevronDownIcon className="w-3 h-3" />
        </Button>
      </span>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[60] w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1"
            style={{ top: position.top, right: position.right }}
          >
            <button
              type="button"
              onClick={() => openForm("assignment")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Assignment
            </button>
            <button
              type="button"
              onClick={() => openForm("course")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <CourseIcon className="w-3.5 h-3.5" />
              Course
            </button>
            <button
              type="button"
              onClick={() => openForm("workSession")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <WorkSessionIcon className="w-3.5 h-3.5" />
              Work session
            </button>
          </div>,
          document.body
        )}

      {activeForm === "assignment" && (
        <Popover
          onClose={closeForm}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Add assignment</p>}
        >
          {() => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <CreateAssignmentForm onCreated={closeForm} onBack={closeForm} />
            </div>
          )}
        </Popover>
      )}

      {activeForm === "course" && (
        <Popover
          onClose={closeForm}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Add course</p>}
        >
          {() => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <InlineCourseForm onCreated={closeForm} onBack={closeForm} />
            </div>
          )}
        </Popover>
      )}

      {activeForm === "workSession" && (
        <CreateWorkSessionPopover
          date={toISODate(new Date())}
          hour={new Date().getHours()}
          useCurrentTimeAsStart
          onClose={closeForm}
        />
      )}
    </>
  );
}
