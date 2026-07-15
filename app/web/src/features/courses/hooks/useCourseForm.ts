import { useState, useEffect } from "react";
import type { CourseDto, CourseFormData, CourseColor } from "../types/course.types";
import { useCreateCourseMutation, useUpdateCourseMutation } from "../queries/useMutations";
import { useAllowedColorsQuery } from "../queries/useAllowedColorsQuery";
import { useCourseStore } from "../store/courseStore";

interface FormState extends CourseFormData {
  errors: Record<string, string>;
}

const initialFormState: FormState = {
  color: "",
  code: "",
  title: "",
  errors: {},
};

export function useCourseForm(courseToEdit?: CourseDto | null) {
  const [formState, setFormState] = useState<FormState>(
    courseToEdit
      ? {
          color: courseToEdit.color,
          code: courseToEdit.code,
          title: courseToEdit.title,
          errors: {},
        }
      : initialFormState
  );

  const { data: colors = [], isLoading: colorsLoading } = useAllowedColorsQuery();
  const createMutation = useCreateCourseMutation();
  const updateMutation = useUpdateCourseMutation();
  const { closeForm } = useCourseStore();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (courseToEdit) {
      setFormState({
        color: courseToEdit.color,
        code: courseToEdit.code,
        title: courseToEdit.title,
        errors: {},
      });
    } else {
      setFormState(initialFormState);
    }
  }, [courseToEdit]);

  const updateField = (field: keyof CourseFormData, value: string) => {
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
      if (courseToEdit) {
        await updateMutation.mutateAsync({
          id: courseToEdit.id,
          data: {
            code: formState.code.trim(),
            title: formState.title.trim(),
            color: formState.color,
          },
        });
      } else {
        await createMutation.mutateAsync({
          code: formState.code.trim(),
          title: formState.title.trim(),
          color: formState.color,
        });
      }
      closeForm();
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
