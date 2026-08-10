import { useWorkSessionForm } from "../hooks/useWorkSessionForm";
import { DurationSelector } from "@/shared/components/DurationSelector";
import { Button } from "@/shared/components/Button";
import { ALLOWED_DURATIONS_MINUTES } from "@/shared/lib/dateTimeForm";
import { AssignmentSelectionList } from "./AssignmentSelectionList";
import { StartTimeField } from "./StartTimeField";

interface WorkSessionFormPanelProps {
  onClose: () => void;
  date: string;
  hour: number;
  useCurrentTimeAsStart?: boolean;
}

export function WorkSessionFormPanel({ onClose, date, hour, useCurrentTimeAsStart }: WorkSessionFormPanelProps) {
  const {
    formState,
    updateField,
    updateDuration,
    handleSubmit,
    isLoading,
    todayDateInput,
    quickTimeBase,
    selectedAssignmentIds,
    toggleAssignment,
  } = useWorkSessionForm(onClose, date, hour, useCurrentTimeAsStart);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 shrink-0">
        <div>
          <StartTimeField
            id="worksession-start"
            dateValue={formState.startDateDay}
            timeValue={formState.startDateTime}
            quickTimeBase={quickTimeBase}
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

      <div className="mt-6 flex-1 min-h-0 flex flex-col">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 shrink-0">Link assignments (optional)</label>
        <AssignmentSelectionList selectedIds={selectedAssignmentIds} onToggle={toggleAssignment} disabled={isLoading} />
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 shrink-0">
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
