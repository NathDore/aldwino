import type { EventDto } from "@/features/events";
import { useGroupedEvents } from "@/features/events";

interface EventPickerProps {
  events: EventDto[];
  selectedEventId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const timeFormat: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  const start = new Date(startTime).toLocaleTimeString(undefined, timeFormat);
  const end = new Date(endTime).toLocaleTimeString(undefined, timeFormat);
  return `${start} – ${end}`;
}

export function EventPicker({ events, selectedEventId, onSelect, isLoading, disabled }: EventPickerProps) {
  const dayGroups = useGroupedEvents(events);

  if (isLoading) {
    return <div className="text-slate-400 text-sm">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <p className="text-slate-600 text-sm">
        No events yet. Create one on the Events page first.
      </p>
    );
  }

  return (
    <div className="border border-slate-300 rounded max-h-64 overflow-y-auto">
      {dayGroups.map((group) => (
        <div key={group.dayKey}>
          <div className="bg-slate-100 text-slate-900 text-xs font-semibold px-3 py-1.5 sticky top-0">
            {group.dayLabel}
          </div>
          {group.events.map((event) => {
            const isSelected = event.id === selectedEventId;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelect(event.id)}
                disabled={disabled}
                className={`w-full text-left px-3 py-2 text-sm border-b border-slate-200 last:border-b-0 transition-colors disabled:opacity-50 ${
                  isSelected
                    ? "bg-emerald-50 border-l-4 border-l-emerald-600 text-slate-900 font-medium"
                    : "hover:bg-slate-50 text-slate-900"
                }`}
              >
                {formatTimeRange(event.startTime, event.endTime)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
