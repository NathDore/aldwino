import { useEffect, useState } from "react";
import type { CourseColor, CourseDto } from "../types/course.types";
import { useUpdateCourseMutation } from "../queries/useMutations";
import { useAllowedColorsQuery } from "../queries/useAllowedColorsQuery";
import { formatCourseCode } from "../utils/formatCourseCode";

interface FormState {
  code: string;
  title: string;
  color: string;
  errors: Record<string, string>;
}

function courseToFields(course: CourseDto): Omit<FormState, "errors"> {
  return { code: course.code, title: course.title, color: course.color };
}

export function useCourseForm(courseToEdit: CourseDto, onSuccess?: () => void) {
  const [formState, setFormState] = useState<FormState>({ ...courseToFields(courseToEdit), errors: {} });

  const { data: colors = [], isLoading: colorsLoading } = useAllowedColorsQuery();
  const updateMutation = useUpdateCourseMutation();
  const isLoading = updateMutation.isPending;

  useEffect(() => {
    setFormState({ ...courseToFields(courseToEdit), errors: {} });
  }, [courseToEdit]);

  const updateField = (field: "code" | "title" | "color", value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: field === "code" ? formatCourseCode(prev.code, value) : value,
      errors: { ...prev.errors, [field]: "" },
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.code.trim()) {
      errors.code = "Course code is required";
    }
    if (!formState.title.trim()) {
      errors.title = "Course title is required";
    }
    if (!formState.color) {
      errors.color = "Color is required";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: courseToEdit.id,
        data: { code: formState.code.trim(), title: formState.title.trim(), color: formState.color },
      });
      onSuccess?.();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFormState((prev) => ({
          ...prev,
          errors: { submit: error.message },
        }));
      }
    }
  };

  return {
    formState,
    updateField,
    handleSubmit,
    isLoading,
    colors: colors as CourseColor[],
    colorsLoading,
  };
}
