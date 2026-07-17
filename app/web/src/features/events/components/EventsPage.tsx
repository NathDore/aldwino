import { useQueryClient } from "@tanstack/react-query";
import { useEventsQuery } from "../queries/useEventsQuery";
import { useDeleteEventMutation } from "../queries/useMutations";
import { useEventStore } from "../store/eventStore";
import { EventList } from "./EventList";
import { EventForm } from "./EventForm";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { Button } from "@/shared/components/Button";

function formatTimeRange(startTime: string, endTime: string): string {
  const timeFormat: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  const start = new Date(startTime).toLocaleTimeString(undefined, timeFormat);
  const end = new Date(endTime).toLocaleTimeString(undefined, timeFormat);
  return `${start} – ${end}`;
}

export function EventsPage() {
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useEventsQuery();
  const deleteMutation = useDeleteEventMutation();
  const {
    isFormOpen,
    selectedEventId,
    showDeleteConfirm,
    openFormForNew,
    setShowDeleteConfirm,
    closeForm,
  } = useEventStore();

  const eventToEdit = selectedEventId ? events.find((e) => e.id === selectedEventId) : null;
  const eventToDelete = selectedEventId ? events.find((e) => e.id === selectedEventId) : null;

  const handleDeleteClick = (id: string) => {
    useEventStore.setState({
      selectedEventId: id,
      showDeleteConfirm: true,
    });
  };

  const handleConfirmDelete = async () => {
    if (selectedEventId) {
      try {
        await deleteMutation.mutateAsync(selectedEventId);
        await queryClient.refetchQueries({ queryKey: ["events"], type: "active" });
        setShowDeleteConfirm(false);
        useEventStore.setState({ selectedEventId: null });
      } catch (error) {
        console.error("Failed to delete event:", error);
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Event Management</h1>
        <Button variant="primary" size="md" onClick={openFormForNew}>
          + Create Event
        </Button>
      </div>

      <EventList
        events={events}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
      />

      {isFormOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <EventForm eventToEdit={eventToEdit} />
          </div>
        </div>
      )}

      {showDeleteConfirm && eventToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-md shadow-lg">
            <DeleteConfirmation
              title="Delete Event?"
              description={
                <>
                  Are you sure you want to delete the event on{" "}
                  <span className="font-medium text-slate-900">
                    {new Date(eventToDelete.startTime).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    , {formatTimeRange(eventToDelete.startTime, eventToDelete.endTime)}
                  </span>
                  ? This action cannot be undone.
                </>
              }
              isLoading={deleteMutation.isPending}
              onConfirm={handleConfirmDelete}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
