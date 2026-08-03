import { useState } from "react";
import type { CourseDto, CourseColor } from "@/features/courses";
import { useCreateCourseMutation, useAllowedColorsQuery } from "@/features/courses";

interface FormState {
  code: string;
  title: string;
  color: string;
  errors: Record<string, string>;
}

const initialFormState: FormState = {
  code: "",
  title: "",
  color: "",
  errors: {},
};

export function useInlineCourseForm(onCreated: (course: CourseDto) => void) {
  const [formState, setFormState] = useState<FormState>(initialFormState);

  const { data: colors = [], isLoading: colorsLoading } = useAllowedColorsQuery();
  const createMutation = useCreateCourseMutation();

  const isLoading = createMutation.isPending;

  const updateField = (field: "code" | "title" | "color", value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
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
      const course = await createMutation.mutateAsync({
        code: formState.code.trim(),
        title: formState.title.trim(),
        color: formState.color,
      });
      setFormState(initialFormState);
      onCreated(course);
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
