import type { WorkSessionDto } from "../types/workSession.types";
import { useRescheduleWorkSessionForm } from "../hooks/useRescheduleWorkSessionForm";
import { DurationSelector } from "@/shared/components/DurationSelector";
import { Button } from "@/shared/components/Button";
import { DateTimeField } from "@/shared/components/DateTimeField";
import { ALLOWED_DURATIONS_MINUTES } from "@/shared/lib/dateTimeForm";
import { LABEL_FONT_SIZE } from "@/shared/lib/formConstants";

interface RescheduleWorkSessionFormProps {
  workSession: WorkSessionDto;
  onClose: () => void;
}

export function RescheduleWorkSessionForm({ workSession, onClose }: RescheduleWorkSessionFormProps) {
  const { formState, updateField, updateDuration, handleSubmit, isLoading, todayDateInput } =
    useRescheduleWorkSessionForm(workSession, onClose);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4">
        <div>
          <DateTimeField
            label="New start time"
            id="reschedule-worksession-start"
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
          <label className={`block ${LABEL_FONT_SIZE} font-semibold text-slate-700 mb-1.5`}>Duration</label>
          <DurationSelector
            durations={ALLOWED_DURATIONS_MINUTES}
            selectedMinutes={formState.durationMinutes}
            onSelect={updateDuration}
            disabled={isLoading}
          />
          {formState.errors.durationMinutes && (
            <p className="text-red-600 text-xs mt-1">{formState.errors.durationMinutes}</p>
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
