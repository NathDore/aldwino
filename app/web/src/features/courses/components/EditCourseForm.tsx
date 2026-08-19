import type { CourseDto } from "../types/course.types";
import { ColorPicker } from "./ColorPicker";
import { Button } from "@/shared/components/Button";
import { useCourseForm } from "../hooks/useCourseForm";
import {
  LABEL_FONT_SIZE,
  ONE_LINE_TEXT_INPUT_HEIGHT,
  ONE_LINE_TEXT_INPUT_WIDTH,
  TEXT_INPUT_FONT_SIZE,
} from "@/shared/lib/formConstants";

interface EditCourseFormProps {
  courseToEdit: CourseDto;
  onSaved: () => void;
  onCancel: () => void;
}

export function EditCourseForm({ courseToEdit, onSaved, onCancel }: EditCourseFormProps) {
  const { formState, updateField, handleSubmit, isLoading, colors, colorsLoading } = useCourseForm(
    courseToEdit,
    onSaved
  );

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4">
        <div>
          <label htmlFor="edit-course-code" className={`block ${LABEL_FONT_SIZE} font-semibold text-slate-700 mb-1.5`}>
            Course Code
          </label>
          <input
            id="edit-course-code"
            type="text"
            value={formState.code}
            onChange={(e) => updateField("code", e.target.value)}
            placeholder="MAT-101"
            className={`${ONE_LINE_TEXT_INPUT_WIDTH} ${ONE_LINE_TEXT_INPUT_HEIGHT} px-4 py-3 ${TEXT_INPUT_FONT_SIZE} rounded-lg bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors ${formState.errors.code
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
              }`}
            disabled={isLoading}
          />
          {formState.errors.code && <p className="text-red-600 text-xs mt-1">{formState.errors.code}</p>}
        </div>

        <div>
          <label htmlFor="edit-course-title" className={`block ${LABEL_FONT_SIZE} font-semibold text-slate-700 mb-1.5`}>
            Course Title
          </label>
          <input
            id="edit-course-title"
            type="text"
            value={formState.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Calculus I"
            className={`${ONE_LINE_TEXT_INPUT_WIDTH} ${ONE_LINE_TEXT_INPUT_HEIGHT} px-4 py-3 ${TEXT_INPUT_FONT_SIZE} rounded-lg bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors ${formState.errors.title
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-emerald-600"
              }`}
            disabled={isLoading}
          />
          {formState.errors.title && <p className="text-red-600 text-xs mt-1">{formState.errors.title}</p>}
        </div>

        <div>
          <label className={`block ${LABEL_FONT_SIZE} font-semibold text-slate-700 mb-1.5`}>Color</label>
          <ColorPicker
            colors={colors}
            selectedColor={formState.color}
            onChange={(color) => updateField("color", color)}
            isLoading={colorsLoading}
          />
          {formState.errors.color && <p className="text-red-600 text-xs mt-1">{formState.errors.color}</p>}
        </div>

        {formState.errors.submit && (
          <div className="p-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs">
            {formState.errors.submit}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-auto pt-4">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
