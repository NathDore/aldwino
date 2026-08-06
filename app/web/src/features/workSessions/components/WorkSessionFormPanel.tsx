import { useWorkSessionForm } from "../hooks/useWorkSessionForm";
import { DurationSelector } from "@/shared/components/DurationSelector";
import { Button } from "@/shared/components/Button";
import { DateTimeField } from "@/shared/components/DateTimeField";
import { DateCard } from "@/shared/components/DateCard";
import { ALLOWED_DURATIONS_MINUTES } from "@/shared/lib/dateTimeForm";

interface WorkSessionFormPanelProps {
  onClose: () => void;
  date: string;
  hour: number;
  useCurrentTimeAsStart?: boolean;
}

export function WorkSessionFormPanel({ onClose, date, hour, useCurrentTimeAsStart }: WorkSessionFormPanelProps) {
  const { formState, updateField, updateDuration, handleSubmit, isLoading, todayDateInput } = useWorkSessionForm(
    onClose,
    date,
    hour,
    useCurrentTimeAsStart
  );

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4">
        <div>
          <DateTimeField
            label="Start"
            id="worksession-start"
            dateValue={formState.startDateDay}
            timeValue={formState.startDateTime}
            onDateChange={(v) => updateField("startDateDay", v)}
            onTimeChange={(v) => updateField("startDateTime", v)}
            dateError={formState.errors.startDateDay}
            timeError={formState.errors.startDateTime}
            disabled={isLoading}
            min={todayDateInput}
            renderDateInput={({ id, value, onChange, disabled, min }) => (
              <DateCard id={id} value={value} onChange={onChange} disabled={disabled} min={min} />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration</label>
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
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}
