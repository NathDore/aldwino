import { useEffect } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import { ALLOWED_DURATIONS_MINUTES, useAssignmentForm } from "../hooks/useAssignmentForm";
import { useAssignmentStore } from "../store/assignmentStore";
import { useCoursesQuery } from "@/features/courses";
import { Button } from "@/shared/components/Button";
import { DateTimeField } from "@/shared/components/DateTimeField";
import { AssignmentDateCard } from "./AssignmentDateCard";
import { CourseSelector } from "./CourseSelector";
import { DurationSelector } from "./DurationSelector";

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
  }, [assignmentToEdit, courses]);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-4 h-full flex flex-col">
      <div className="flex flex-col gap-6 md:flex-row flex-1">
        <div className="min-w-0 flex-1 flex flex-col justify-between">
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

          <div className="mt-3">
            <label htmlFor="description" className="block text-xs font-semibold text-slate-900 mb-1">
              Assignment name
            </label>
            <textarea
              id="description"
              value={formState.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Read chapters 1-3 and submit the exercises"
              rows={1}
              className={`w-full px-3 py-2 text-sm bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors resize-none flex items-center ${formState.errors.description
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
                label="Study Start"
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
                onDateChange={(v) => {
                  updateField("dueDateDay", v);
                  updateField("dueDateTime", "23:59");
                }}
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
            <label className="block text-xs font-semibold text-slate-900 mb-1">Duration</label>
            <DurationSelector
              durations={ALLOWED_DURATIONS_MINUTES}
              selectedMinutes={formState.expectedDurationMinutes}
              onSelect={updateDuration}
              disabled={isLoading}
            />
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
        </div>

        <div className="w-full shrink-0 border-slate-200 pt-4 md:flex md:w-64 md:flex-col md:border-l md:pl-4 md:pt-0">
          <label className="block text-xs font-semibold text-slate-900 mb-1">Tasks</label>
          <div className="flex flex-1 min-h-[140px] items-center justify-center rounded border border-dashed border-slate-300 bg-white p-3 text-center text-xs text-slate-400">
            Task checklist coming soon
          </div>
        </div>
      </div>

      {formState.errors.submit && (
        <div className="p-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs">
          {formState.errors.submit}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-6 mt-auto">
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
