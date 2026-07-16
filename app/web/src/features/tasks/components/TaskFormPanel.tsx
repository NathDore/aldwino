import { useEffect } from "react";
import { Button } from "@/shared/components/Button";
import { AssignmentDto } from "@/features/assignments/types/assignment.types";
import { CourseDto } from "@/features/courses/types/course.types";
import { EventDto } from "@/features/events/types/event.types";
import { useGroupedEvents } from "@/features/events/hooks/useGroupedEvents";
import { useTaskForm } from "../hooks/useTaskForm";
import { useTaskStore } from "../store/taskStore";
import { TaskDto } from "../types/task.types";

interface TaskFormPanelProps {
  isOpen: boolean;
  editingTask?: TaskDto;
  assignments: AssignmentDto[];
  courses: CourseDto[];
  events: EventDto[];
  onSubmit: (assignmentId: string, description: string, isCompleted: boolean) => Promise<void>;
  isLoading?: boolean;
}

export const TaskFormPanel = ({
  isOpen,
  editingTask,
  assignments,
  courses,
  events,
  onSubmit,
  isLoading = false,
}: TaskFormPanelProps) => {
  const { closeForm, selectedAssignmentId } = useTaskStore();
  const groupedEvents = useGroupedEvents(events);
  const form = useTaskForm(
    editingTask
      ? {
        assignmentId: editingTask.assignmentId,
        description: editingTask.description,
        isCompleted: editingTask.isCompleted,
      }
      : undefined
  );

  useEffect(() => {
    if (isOpen && editingTask) {
      form.reinitialize({
        assignmentId: editingTask.assignmentId,
        description: editingTask.description,
        isCompleted: editingTask.isCompleted,
      });
    } else if (!isOpen) {
      form.reset();
    }
  }, [isOpen, editingTask?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen && !editingTask && selectedAssignmentId && !form.formState.assignmentId) {
      form.updateField("assignmentId", selectedAssignmentId);
    }
  }, [isOpen, selectedAssignmentId, editingTask]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!form.validateForm()) {
      return;
    }

    try {
      await onSubmit(
        form.formState.assignmentId,
        form.formState.description,
        editingTask ? editingTask.isCompleted : false
      );
      closeForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeForm();
    }
  };

  const isCreating = !editingTask;

  const selectedAssignment = assignments.find(
    (a) => a.id === form.formState.assignmentId
  );

  const getAssignmentDisplay = (assignment: AssignmentDto) => {
    const course = courses.find((c) => c.id === assignment.courseId);
    const event = events.find((e) => e.id === assignment.eventId);
    const eventDate = event
      ? new Date(event.startTime).toLocaleDateString()
      : "";
    return `${course?.code} - ${assignment.description} (${eventDate})`;
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-sm" onClick={closeForm} />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md transform overflow-y-auto bg-white shadow-xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          } z-50`}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900">
            {isCreating ? "Create Task" : "Edit Task"}
          </h2>
          <button
            onClick={closeForm}
            className="text-slate-500 hover:text-slate-700 focus:outline-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Select Assignment
            </label>
            <select
              value={form.formState.assignmentId}
              onChange={(e) => form.updateField("assignmentId", e.target.value)}
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 ${form.formState.errors.assignmentId
                  ? "border-red-500"
                  : "border-slate-300 bg-white"
                }`}
            >
              <option value="">Choose an assignment...</option>
              {groupedEvents
                .map((dayGroup) => ({
                  ...dayGroup,
                  events: dayGroup.events.filter(
                    (event) => assignments.some((a) => a.eventId === event.id)
                  ),
                }))
                .filter((dayGroup) => dayGroup.events.length > 0)
                .map((dayGroup) => (
                  <optgroup key={dayGroup.dayKey} label={dayGroup.dayLabel}>
                    {dayGroup.events.map((event) => {
                      const eventAssignments = assignments.filter(
                        (a) => a.eventId === event.id
                      );
                      return eventAssignments.map((assignment) => (
                        <option key={assignment.id} value={assignment.id}>
                          {getAssignmentDisplay(assignment)}
                        </option>
                      ));
                    })}
                  </optgroup>
                ))}
            </select>
            {form.formState.errors.assignmentId && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.assignmentId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={form.formState.description}
              onChange={(e) => form.updateField("description", e.target.value)}
              placeholder="Enter task description"
              maxLength={form.MAX_DESCRIPTION_LENGTH}
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 ${form.formState.errors.description
                  ? "border-red-500 bg-white"
                  : "border-slate-300 bg-white"
                }`}
            />
            <div className="mt-1.5 flex justify-between">
              {form.formState.errors.description && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.description}
                </p>
              )}
              <p className="text-xs text-slate-600 ml-auto">
                {form.formState.description.length}/{form.MAX_DESCRIPTION_LENGTH}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Saving..." : isCreating ? "Create Task" : "Save Changes"}
            </Button>
            <Button variant="ghost" onClick={closeForm} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
