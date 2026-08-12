import { useEffect, useState } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";
import { useAssignmentForm } from "../hooks/useAssignmentForm";
import { CourseSelector } from "@/features/courses/components/CourseSelector";
import { useCoursesQuery } from "@/features/courses";
import { InlineCourseForm } from "@/features/courses/components/InlineCourseForm";
import { Button } from "@/shared/components/Button";
import { DateTimeField } from "@/shared/components/DateTimeField";
import { ArrowLeftIcon } from "@/features/calendar/components/icons";
import {
  LABEL_FONT_SIZE,
  MULTI_LINE_TEXT_INPUT_HEIGHT,
  MULTI_LINE_TEXT_INPUT_WIDTH,
  TEXT_INPUT_FONT_SIZE,
} from "@/shared/lib/formConstants";

interface AssignmentFormPanelProps {
  onClose: () => void;
  assignmentToEdit: AssignmentDto;
}

type Mode = "assignment" | "create-course";

export function AssignmentFormPanel({ onClose, assignmentToEdit }: AssignmentFormPanelProps) {
  const [mode, setMode] = useState<Mode>("assignment");
  const [pendingCourseId, setPendingCourseId] = useState<string | undefined>(undefined);

  const handleCourseCreated = (course: CourseDto) => {
    setPendingCourseId(course.id);
    setMode("assignment");
  };

  return (
    <div className="grid h-full">
      <div className={`col-start-1 row-start-1 h-full ${mode === "create-course" ? "invisible" : ""}`}>
        <AssignmentEditForm
          onClose={onClose}
          assignmentToEdit={assignmentToEdit}
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

interface AssignmentEditFormProps {
  onClose: () => void;
  assignmentToEdit: AssignmentDto;
  onRequestCreateCourse: () => void;
  pendingCourseId?: string;
}

function AssignmentEditForm({ onClose, assignmentToEdit, onRequestCreateCourse, pendingCourseId }: AssignmentEditFormProps) {
  const { formState, updateField, handleSubmit, isLoading, todayDateInput } = useAssignmentForm(
    assignmentToEdit,
    onClose
  );
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
          onClick={onClose}
          disabled={isLoading}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 disabled:opacity-50"
        >
          <ArrowLeftIcon className="w-3 h-3" />
          Back
        </button>

        <div>
          <label className={`block ${LABEL_FONT_SIZE} font-semibold text-slate-700 mb-1.5`}>Courses</label>
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
          <label htmlFor="assignment-name" className={`block ${LABEL_FONT_SIZE} font-semibold text-slate-700 mb-1.5`}>
            Assignment
          </label>
          <textarea
            id="assignment-name"
            value={formState.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Read chapters 1-3 and submit the exercises"
            className={`${MULTI_LINE_TEXT_INPUT_WIDTH} ${MULTI_LINE_TEXT_INPUT_HEIGHT} px-4 py-3 ${TEXT_INPUT_FONT_SIZE} rounded-lg bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors resize-none ${formState.errors.name
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
            id="assignment-dueDate"
            dateValue={formState.dueDateDay}
            timeValue={formState.dueDateTime}
            onDateChange={(v) => updateField("dueDateDay", v)}
            onTimeChange={(v) => updateField("dueDateTime", v)}
            dateError={formState.errors.dueDateDay}
            timeError={formState.errors.dueDateTime}
            disabled={isLoading}
            min={todayDateInput}
          />
        </div>

        {formState.errors.submit && (
          <div className="p-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs">
            {formState.errors.submit}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-auto pt-4">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading || courses.length === 0}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
