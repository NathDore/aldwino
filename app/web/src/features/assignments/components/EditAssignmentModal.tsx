import { Popover } from "@/shared/components/Popover";
import { AssignmentFormPanel } from "./AssignmentFormPanel";
import type { CalendarAssignment } from "@/features/calendar/types/calendar.types";
import { formatCourseLabel } from "@/features/courses";

const FORM_WIDTH = 1200;
const FORM_HEIGHT = 1000;

interface EditAssignmentModalProps {
  item: CalendarAssignment;
  onClose: () => void;
}

export function EditAssignmentModal({ item, onClose }: EditAssignmentModalProps) {
  const { assignment, course } = item;

  return (
    <Popover
      onClose={onClose}
      panelClassName="max-w-full max-h-full"
      panelStyle={{ width: FORM_WIDTH, height: FORM_HEIGHT }}
      headerClassName="px-10 py-3"
      header={
        <div className="min-w-0 flex items-center gap-2">
          {course && (
            <div
              className="w-3.5 h-3.5 shrink-0 rounded-sm border border-slate-400"
              style={{ backgroundColor: course.color }}
              aria-hidden="true"
            />
          )}
          <p className="text-xs text-slate-600 truncate">{course ? formatCourseLabel(course) : ""}</p>
          <p className="text-sm font-bold text-slate-900 shrink-0">Edit Assignment</p>
        </div>
      }
    >
      {(handleClose) => (
        <div className="px-10 py-4 overflow-hidden min-h-0">
          <AssignmentFormPanel assignmentToEdit={assignment} onClose={handleClose} />
        </div>
      )}
    </Popover>
  );
}
