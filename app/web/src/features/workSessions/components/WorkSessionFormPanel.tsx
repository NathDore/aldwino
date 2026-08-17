import { useWorkSessionForm } from "../hooks/useWorkSessionForm";
import { DurationSelector } from "@/shared/components/DurationSelector";
import { Button } from "@/shared/components/Button";
import { ALLOWED_DURATIONS_MINUTES } from "@/shared/lib/dateTimeForm";
import { formatTime12h } from "@/shared/lib/timeDigits";
import { AssignmentLinkSelector } from "@/features/assignments/components/AssignmentLinkSelector";
import { StartTimeField } from "./StartTimeField";
import { LABEL_FONT_SIZE } from "@/shared/lib/formConstants";

interface WorkSessionFormPanelProps {
  onClose: () => void;
  date: string;
  hour: number;
  useCurrentTimeAsStart?: boolean;
  onRequestCreateAssignment: () => void;
  pendingAssignmentId?: string;
}

export function WorkSessionFormPanel({
  onClose,
  date,
  hour,
  useCurrentTimeAsStart,
  onRequestCreateAssignment,
  pendingAssignmentId,
}: WorkSessionFormPanelProps) {
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
    effectiveEndTime,
  } = useWorkSessionForm(onClose, date, hour, useCurrentTimeAsStart, pendingAssignmentId);

  const startTimeParts = formState.startDateTime.split(":");
  const startTimeLabel =
    startTimeParts.length === 2 ? formatTime12h(Number(startTimeParts[0]), Number(startTimeParts[1])) : null;
  const endTimeLabel = effectiveEndTime ? formatTime12h(effectiveEndTime.getHours(), effectiveEndTime.getMinutes()) : null;

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
          <div className="flex items-baseline justify-between mb-1.5">
            <label className={`${LABEL_FONT_SIZE} font-semibold text-slate-700`}>Duration</label>
            {startTimeLabel && endTimeLabel && (
              <p className="text-xs text-slate-500 whitespace-nowrap">
                {startTimeLabel} → <span className="font-semibold text-slate-900">{endTimeLabel}</span>
              </p>
            )}
          </div>
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
        <AssignmentLinkSelector
          selectedIds={selectedAssignmentIds}
          onToggle={toggleAssignment}
          onRequestCreateAssignment={onRequestCreateAssignment}
          disabled={isLoading}
          optional
        />
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
