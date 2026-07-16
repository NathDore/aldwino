import type { AssignmentDto } from "../types/assignment.types";
import { useAssignmentForm } from "../hooks/useAssignmentForm";
import { useAssignmentStore } from "../store/assignmentStore";
import { EventPicker } from "./EventPicker";
import { useCoursesQuery } from "@/features/courses";
import { useEventsQuery } from "@/features/events";
import { Button } from "@/shared/components/Button";

interface AssignmentFormProps {
  assignmentToEdit?: AssignmentDto | null;
}

export function AssignmentForm({ assignmentToEdit }: AssignmentFormProps) {
  const { closeForm } = useAssignmentStore();
  const { formState, updateField, handleSubmit, isLoading } = useAssignmentForm(assignmentToEdit);
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery();
  const { data: events = [], isLoading: eventsLoading } = useEventsQuery();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        {assignmentToEdit ? "Edit Assignment" : "Create New Assignment"}
      </h2>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          value={formState.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Read chapters 1-3 and submit the exercises"
          rows={3}
          className={`w-full px-4 py-2 bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors resize-none ${
            formState.errors.description
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={isLoading}
        />
        {formState.errors.description && (
          <p className="text-red-600 text-sm mt-1">{formState.errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-900 mb-1.5">
          Due Date
        </label>
        <input
          id="dueDate"
          type="date"
          value={formState.dueDate}
          onChange={(e) => updateField("dueDate", e.target.value)}
          className={`w-full px-4 py-2 bg-white border text-slate-900 focus:outline-none transition-colors ${
            formState.errors.dueDate
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={isLoading}
        />
        {formState.errors.dueDate && (
          <p className="text-red-600 text-sm mt-1">{formState.errors.dueDate}</p>
        )}
      </div>

      <div>
        <label htmlFor="courseId" className="block text-sm font-semibold text-slate-900 mb-1.5">
          Course
        </label>
        <select
          id="courseId"
          value={formState.courseId}
          onChange={(e) => updateField("courseId", e.target.value)}
          className={`w-full px-4 py-2 bg-white border text-slate-900 focus:outline-none transition-colors ${
            formState.errors.courseId
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={isLoading || coursesLoading}
        >
          <option value="">Select a course...</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.title}
            </option>
          ))}
        </select>
        {formState.errors.courseId && (
          <p className="text-red-600 text-sm mt-1">{formState.errors.courseId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-1.5">Event</label>
        <EventPicker
          events={events}
          selectedEventId={formState.eventId}
          onSelect={(id) => updateField("eventId", id)}
          isLoading={eventsLoading}
          disabled={isLoading}
        />
        {formState.errors.eventId && (
          <p className="text-red-600 text-sm mt-1">{formState.errors.eventId}</p>
        )}
      </div>

      {formState.errors.submit && (
        <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
          {formState.errors.submit}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="ghost" size="md" onClick={closeForm} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Assignment"}
        </Button>
      </div>
    </div>
  );
}
