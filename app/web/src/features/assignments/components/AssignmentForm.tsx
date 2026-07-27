import { useEffect } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import { ALLOWED_DURATIONS_MINUTES, useAssignmentForm } from "../hooks/useAssignmentForm";
import { useAssignmentStore } from "../store/assignmentStore";
import { useCoursesQuery } from "@/features/courses";
import { Button } from "@/shared/components/Button";
import { DateTimeField } from "@/shared/components/DateTimeField";
import { AssignmentDateCard } from "./AssignmentDateCard";
import { CourseSelector } from "./CourseSelector";

interface AssignmentFormProps {
  assignmentToEdit?: AssignmentDto | null;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function AssignmentForm({ assignmentToEdit }: AssignmentFormProps) {
  const { cancelEdit } = useAssignmentStore();
  const {
    formState,
    updateField,
    updateDuration,
    handleSubmit,
    isLoading,
    effectiveEndTime,
    effectiveDurationMinutes,
    wasClamped,
    noFittingDuration,
  } = useAssignmentForm(assignmentToEdit);
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery();

  useEffect(() => {
    if (!assignmentToEdit && !formState.courseId && courses.length > 0) {
      updateField("courseId", courses[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentToEdit, courses]);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded p-5 space-y-3">
      <h2 className="text-lg font-bold text-slate-900 mb-2">
        {assignmentToEdit ? "Edit Assignment" : "Create New Assignment"}
      </h2>

      <div>
        <label className="block text-xs font-semibold text-slate-900 mb-1">Course</label>
        {coursesLoading ? (
          <p className="text-sm text-slate-400">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-slate-600">No courses yet. Create one to get started.</p>
        ) : (
          <CourseSelector
            courses={courses}
            selectedCourseId={formState.courseId}
            onSelect={(id) => updateField("courseId", id)}
            disabled={isLoading}
          />
        )}
        {formState.errors.courseId && (
          <p className="text-red-600 text-xs mt-1">{formState.errors.courseId}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-semibold text-slate-900 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formState.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Read chapters 1-3 and submit the exercises"
          rows={2}
          className={`w-full px-3 py-1.5 text-sm bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors resize-none ${
            formState.errors.description
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={isLoading}
        />
        {formState.errors.description && (
          <p className="text-red-600 text-xs mt-1">{formState.errors.description}</p>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <DateTimeField
            label="Start Time"
            id="startTime"
            dateValue={formState.startDateDay}
            timeValue={formState.startDateTime}
            onDateChange={(v) => updateField("startDateDay", v)}
            onTimeChange={(v) => updateField("startDateTime", v)}
            dateError={formState.errors.startDateDay}
            timeError={formState.errors.startDateTime}
            disabled={isLoading}
            renderDateInput={({ id, value, onChange, disabled }) => (
              <AssignmentDateCard id={id} value={value} onChange={onChange} disabled={disabled} />
            )}
          />
        </div>

        <div className="flex-1">
          <DateTimeField
            label="Due Date"
            id="dueDate"
            dateValue={formState.dueDateDay}
            timeValue={formState.dueDateTime}
            onDateChange={(v) => updateField("dueDateDay", v)}
            onTimeChange={(v) => updateField("dueDateTime", v)}
            dateError={formState.errors.dueDateDay}
            timeError={formState.errors.dueDateTime}
            disabled={isLoading}
            renderDateInput={({ id, value, onChange, disabled }) => (
              <AssignmentDateCard id={id} value={value} onChange={onChange} disabled={disabled} />
            )}
          />
        </div>
      </div>

      <div>
        <label htmlFor="expectedDurationMinutes" className="block text-xs font-semibold text-slate-900 mb-1">
          Duration
        </label>
        <select
          id="expectedDurationMinutes"
          value={formState.expectedDurationMinutes}
          onChange={(e) => updateDuration(Number(e.target.value))}
          className={`w-full px-3 py-1.5 text-sm bg-white border text-slate-900 focus:outline-none transition-colors ${
            formState.errors.expectedDurationMinutes
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={isLoading}
        >
          {ALLOWED_DURATIONS_MINUTES.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minutes
            </option>
          ))}
        </select>
        {formState.errors.expectedDurationMinutes && (
          <p className="text-red-600 text-xs mt-1">{formState.errors.expectedDurationMinutes}</p>
        )}
        {effectiveEndTime && (
          <p className="text-xs text-slate-600 mt-1">
            {wasClamped
              ? `Shortened to ${effectiveDurationMinutes} minutes — ends at ${formatTime(effectiveEndTime)} to stay within the day`
              : `Ends at ${formatTime(effectiveEndTime)}`}
          </p>
        )}
        {noFittingDuration && (
          <p className="text-red-600 text-xs mt-1">
            No session length fits before midnight — choose an earlier start time.
          </p>
        )}
      </div>

      {formState.errors.submit && (
        <div className="p-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs">
          {formState.errors.submit}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {assignmentToEdit && (
          <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Saving..." : assignmentToEdit ? "Save Changes" : "Create Assignment"}
        </Button>
      </div>
    </div>
  );
}
