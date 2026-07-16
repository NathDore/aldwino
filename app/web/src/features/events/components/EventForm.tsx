import type { EventDto } from "../types/event.types";
import { useEventForm } from "../hooks/useEventForm";
import { useEventStore } from "../store/eventStore";
import { Button } from "@/shared/components/Button";

interface EventFormProps {
  eventToEdit?: EventDto | null;
}

export function EventForm({ eventToEdit }: EventFormProps) {
  const { closeForm } = useEventStore();
  const { formState, updateField, handleSubmit, isLoading } = useEventForm(eventToEdit);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        {eventToEdit ? "Edit Event" : "Create New Event"}
      </h2>

      <div>
        <label htmlFor="date" className="block text-sm font-semibold text-slate-900 mb-1.5">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={formState.date}
          onChange={(e) => updateField("date", e.target.value)}
          className={`w-full px-4 py-2 bg-white border text-slate-900 focus:outline-none transition-colors ${
            formState.errors.date
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={isLoading}
        />
        {formState.errors.date && (
          <p className="text-red-600 text-sm mt-1">{formState.errors.date}</p>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="startTime" className="block text-sm font-semibold text-slate-900 mb-1.5">
            Start time
          </label>
          <input
            id="startTime"
            type="time"
            value={formState.startTimeStr}
            onChange={(e) => updateField("startTimeStr", e.target.value)}
            className={`w-full px-4 py-2 bg-white border text-slate-900 focus:outline-none transition-colors ${
              formState.errors.startTimeStr
                ? "border-red-500 focus:border-red-600"
                : "border-slate-300 focus:border-emerald-600"
            }`}
            disabled={isLoading}
          />
          {formState.errors.startTimeStr && (
            <p className="text-red-600 text-sm mt-1">{formState.errors.startTimeStr}</p>
          )}
        </div>

        <div className="flex-1">
          <label htmlFor="endTime" className="block text-sm font-semibold text-slate-900 mb-1.5">
            End time
          </label>
          <input
            id="endTime"
            type="time"
            value={formState.endTimeStr}
            onChange={(e) => updateField("endTimeStr", e.target.value)}
            className={`w-full px-4 py-2 bg-white border text-slate-900 focus:outline-none transition-colors ${
              formState.errors.endTimeStr
                ? "border-red-500 focus:border-red-600"
                : "border-slate-300 focus:border-emerald-600"
            }`}
            disabled={isLoading}
          />
          {formState.errors.endTimeStr && (
            <p className="text-red-600 text-sm mt-1">{formState.errors.endTimeStr}</p>
          )}
        </div>
      </div>

      {formState.errors.submit && (
        <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
          {formState.errors.submit}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6">
        <Button
          variant="ghost"
          size="md"
          onClick={closeForm}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Event"}
        </Button>
      </div>
    </div>
  );
}
