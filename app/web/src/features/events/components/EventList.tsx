import type { EventDto } from "../types/event.types";
import { useGroupedEvents } from "../hooks/useGroupedEvents";
import { useEventStore } from "../store/eventStore";
import { Button } from "@/shared/components/Button";

interface EventListProps {
  events: EventDto[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const timeFormat: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  const start = new Date(startTime).toLocaleTimeString(undefined, timeFormat);
  const end = new Date(endTime).toLocaleTimeString(undefined, timeFormat);
  return `${start} – ${end}`;
}

export function EventList({ events, isLoading, onDelete }: EventListProps) {
  const { openFormForEdit } = useEventStore();
  const dayGroups = useGroupedEvents(events);

  if (isLoading) {
    return <div className="text-slate-400">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 text-sm">No events yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dayGroups.map((group) => (
        <div key={group.dayKey}>
          <h2 className="text-xl font-bold text-slate-900 mb-3">{group.dayLabel}</h2>
          <div className="border border-slate-300 rounded overflow-x-auto">
            {group.events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between border-b border-slate-200 last:border-b-0 p-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-slate-900 font-medium">
                    {formatTimeRange(event.startTime, event.endTime)}
                  </p>
                  <p className="text-slate-600 text-xs font-mono mt-1">
                    debug: {event.startTime} &rarr; {event.endTime}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openFormForEdit(event.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(event.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
