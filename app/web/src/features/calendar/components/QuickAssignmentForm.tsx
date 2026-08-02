import { useEffect } from "react";
import type { AssignmentDto } from "@/features/assignments/types/assignment.types";
import { ALLOWED_DURATIONS_MINUTES, useAssignmentForm } from "@/features/assignments/hooks/useAssignmentForm";
import { AssignmentDateCard } from "@/features/assignments/components/AssignmentDateCard";
import { CourseSelector } from "@/features/assignments/components/CourseSelector";
import { DurationSelector } from "@/features/assignments/components/DurationSelector";
import { useCoursesQuery } from "@/features/courses";
import { Button } from "@/shared/components/Button";
import { DateTimeField } from "@/shared/components/DateTimeField";

interface QuickAssignmentFormProps {
  onClose: () => void;
  assignmentToEdit?: AssignmentDto | null;
  date?: string;
  hour?: number;
}

function hourToTimeInput(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export function QuickAssignmentForm({ date, hour, onClose, assignmentToEdit }: QuickAssignmentFormProps) {
  const { formState, updateField, updateDuration, handleSubmit, isLoading } = useAssignmentForm(
    assignmentToEdit,
    onClose
  );
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery();

  useEffect(() => {
    if (assignmentToEdit || date === undefined || hour === undefined) return;
    updateField("startDateDay", date);
    updateField("startDateTime", hourToTimeInput(hour));
  }, [assignmentToEdit, date, hour]);

  useEffect(() => {
    if (!formState.courseId && courses.length > 0) {
      updateField("courseId", courses[0].id);
    }
  }, [formState.courseId, courses]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-900 mb-1">Courses</label>
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
        {formState.errors.courseId && <p className="text-red-600 text-xs mt-1">{formState.errors.courseId}</p>}
      </div>

      <div>
        <label htmlFor="quick-description" className="block text-xs font-semibold text-slate-900 mb-1">
          Assignment
        </label>
        <textarea
          id="quick-description"
          value={formState.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Read chapters 1-3 and submit the exercises"
          rows={2}
          className={`w-full px-3 py-2 text-sm bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors resize-none ${formState.errors.description
            ? "border-red-500 focus:border-red-600"
            : "border-slate-300 focus:border-emerald-600"
            }`}
          disabled={isLoading}
        />
        {formState.errors.description && (
          <p className="text-red-600 text-xs mt-1">{formState.errors.description}</p>
        )}
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
      </div>

      <div>
        <DateTimeField
          label="Due"
          id="quick-dueDate"
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

      {formState.errors.submit && (
        <div className="p-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs">
          {formState.errors.submit}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading || courses.length === 0}>
          {assignmentToEdit ? (isLoading ? "Saving..." : "Save Changes") : isLoading ? "Creating..." : "Create Assignment"}
        </Button>
      </div>
    </div>
  );
}
