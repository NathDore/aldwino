import type { CourseDto } from "../types/course.types";
import { useCourseForm } from "../hooks/useCourseForm";
import { ColorPicker } from "./ColorPicker";
import { useCourseStore } from "../store/courseStore";
import { Button } from "@/shared/components/Button";

interface CourseFormProps {
  courseToEdit?: CourseDto | null;
}

export function CourseForm({ courseToEdit }: CourseFormProps) {
  const { closeForm } = useCourseStore();
  const { formState, updateField, handleSubmit, isLoading, colors, colorsLoading } =
    useCourseForm(courseToEdit);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        {courseToEdit ? "Edit Course" : "Create New Course"}
      </h2>

      <div>
        <label htmlFor="code" className="block text-sm font-semibold text-slate-900 mb-1.5">
          Course Code
        </label>
        <input
          id="code"
          type="text"
          value={formState.code}
          onChange={(e) => updateField("code", e.target.value)}
          placeholder="MAT-101"
          className={`w-full px-4 py-2 bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors ${
            formState.errors.code
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={isLoading}
        />
        {formState.errors.code && (
          <p className="text-red-600 text-sm mt-1">{formState.errors.code}</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-1.5">
          Course Title
        </label>
        <input
          id="title"
          type="text"
          value={formState.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Calculus I"
          className={`w-full px-4 py-2 bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors ${
            formState.errors.title
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={isLoading}
        />
        {formState.errors.title && (
          <p className="text-red-600 text-sm mt-1">{formState.errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Color</label>
        <ColorPicker
          colors={colors}
          selectedColor={formState.color}
          onChange={(color) => updateField("color", color)}
          isLoading={colorsLoading}
        />
        {formState.errors.color && (
          <p className="text-red-600 text-sm mt-2">{formState.errors.color}</p>
        )}
      </div>

      {formState.errors.submit && (
        <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
          {formState.errors.submit}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6">
        <Button
          variant="ghost"
          size="md"
          onClick={closeForm}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Course"}
        </Button>
      </div>
    </div>
  );
}
