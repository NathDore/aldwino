import { useEffect, useState } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";
import { useCreateAssignmentForm } from "../hooks/useCreateAssignmentForm";
import { CourseSelector } from "@/features/courses/components/CourseSelector";
import { useCoursesQuery } from "@/features/courses";
import { InlineCourseForm } from "@/features/courses/components/InlineCourseForm";
import { Button } from "@/shared/components/Button";
import { DateTimeField } from "@/shared/components/DateTimeField";
import { DateCard } from "@/shared/components/DateCard";
import { ArrowLeftIcon } from "@/features/calendar/components/icons";

interface CreateAssignmentFormProps {
  onCreated: (assignment: AssignmentDto) => void;
  onBack: () => void;
}

type Mode = "assignment" | "create-course";

export function CreateAssignmentForm({ onCreated, onBack }: CreateAssignmentFormProps) {
  const [mode, setMode] = useState<Mode>("assignment");
  const [pendingCourseId, setPendingCourseId] = useState<string | undefined>(undefined);

  const handleCourseCreated = (course: CourseDto) => {
    setPendingCourseId(course.id);
    setMode("assignment");
  };

  return (
    <div className="grid h-full">
      <div className={`col-start-1 row-start-1 h-full ${mode === "create-course" ? "invisible" : ""}`}>
        <AssignmentCreateFields
          onCreated={onCreated}
          onBack={onBack}
          onRequestCreateCourse={() => setMode("create-course")}
          pendingCourseId={pendingCourseId}
        />
      </div>
      {mode === "create-course" && (
        <div className="col-start-1 row-start-1 h-full">
          <InlineCourseForm onCreated={handleCourseCreated} onBack={() => setMode("assignment")} />
        </div>
      )}
    </div>
  );
}

interface AssignmentCreateFieldsProps {
  onCreated: (assignment: AssignmentDto) => void;
  onBack: () => void;
  onRequestCreateCourse: () => void;
  pendingCourseId?: string;
}

function AssignmentCreateFields({ onCreated, onBack, onRequestCreateCourse, pendingCourseId }: AssignmentCreateFieldsProps) {
  const { formState, updateField, handleSubmit, isLoading, todayDateInput } = useCreateAssignmentForm(onCreated);
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery();

  useEffect(() => {
    if (pendingCourseId) {
      updateField("courseId", pendingCourseId);
    }
  }, [pendingCourseId]);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 disabled:opacity-50"
        >
          <ArrowLeftIcon className="w-3 h-3" />
          Back
        </button>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Courses</label>
          {coursesLoading ? (
            <p className="text-sm text-slate-400">Loading courses...</p>
          ) : (
            <CourseSelector
              courses={courses}
              selectedCourseId={formState.courseId}
              onSelect={(id) => updateField("courseId", id)}
              onRequestCreateCourse={onRequestCreateCourse}
              disabled={isLoading}
            />
          )}
          {formState.errors.courseId && <p className="text-red-600 text-xs mt-1">{formState.errors.courseId}</p>}
        </div>

        <div>
          <label htmlFor="create-assignment-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Assignment
          </label>
          <textarea
            id="create-assignment-name"
            value={formState.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Read chapters 1-3 and submit the exercises"
            rows={2}
            className={`w-full px-4 py-3 text-base rounded-lg bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors resize-none ${formState.errors.name
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
              }`}
            disabled={isLoading}
          />
          {formState.errors.name && <p className="text-red-600 text-xs mt-1">{formState.errors.name}</p>}
        </div>

        <div>
          <DateTimeField
            label="Due"
            id="create-assignment-dueDate"
            dateValue={formState.dueDateDay}
            timeValue={formState.dueDateTime}
            onDateChange={(v) => updateField("dueDateDay", v)}
            onTimeChange={(v) => updateField("dueDateTime", v)}
            dateError={formState.errors.dueDateDay}
            timeError={formState.errors.dueDateTime}
            disabled={isLoading}
            min={todayDateInput}
            renderDateInput={({ id, value, onChange, disabled, min }) => (
              <DateCard id={id} value={value} onChange={onChange} disabled={disabled} min={min} />
            )}
          />
        </div>

        {formState.errors.submit && (
          <div className="p-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs">
            {formState.errors.submit}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-auto pt-4">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading || courses.length === 0}>
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}
