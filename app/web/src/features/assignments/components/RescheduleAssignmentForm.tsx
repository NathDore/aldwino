import { ALLOWED_DURATIONS_MINUTES } from "../hooks/useAssignmentForm";
import { useRescheduleForm } from "../hooks/useRescheduleForm";
import { DurationSelector } from "./DurationSelector";
import { Button } from "@/shared/components/Button";
import { DateTimeField } from "@/shared/components/DateTimeField";
import { formatCourseLabel } from "@/features/courses";
import type { CalendarAssignment } from "@/features/calendar/types/calendar.types";

interface RescheduleAssignmentFormProps {
  item: CalendarAssignment;
  onClose: () => void;
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RescheduleAssignmentForm({ item, onClose }: RescheduleAssignmentFormProps) {
  const { assignment, course } = item;
  const { formState, updateField, updateDuration, handleSubmit, isLoading, todayDateInput } = useRescheduleForm(
    assignment,
    onClose
  );

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-600 truncate">
            {course ? formatCourseLabel(course) : "Unknown course"}
          </p>
          <p className="text-sm text-slate-900 mt-0.5 whitespace-normal break-words">{assignment.description}</p>
          <p className="text-xs text-slate-600 mt-1.5">Due {formatDueDate(assignment.dueDate)}</p>
        </div>

        <div>
          <DateTimeField
            label="New start time"
            id="reschedule-start"
            dateValue={formState.startDateDay}
            timeValue={formState.startDateTime}
            onDateChange={(v) => updateField("startDateDay", v)}
            onTimeChange={(v) => updateField("startDateTime", v)}
            dateError={formState.errors.startDateDay}
            timeError={formState.errors.startDateTime}
            disabled={isLoading}
            min={todayDateInput}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration</label>
          <DurationSelector
            durations={ALLOWED_DURATIONS_MINUTES}
            selectedMinutes={formState.expectedDurationMinutes}
            onSelect={updateDuration}
            disabled={isLoading}
          />
          {formState.errors.expectedDurationMinutes && (
            <p className="text-red-600 text-xs mt-1">{formState.errors.expectedDurationMinutes}</p>
          )}
        </div>

        {formState.errors.submit && (
          <div className="p-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs">
            {formState.errors.submit}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-auto pt-4">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Rescheduling..." : "Reschedule"}
        </Button>
      </div>
    </div>
  );
}
