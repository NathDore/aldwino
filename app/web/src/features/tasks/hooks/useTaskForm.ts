import { useState } from "react";
import { TaskFormData, TaskFormState } from "../types/task.types";

const MAX_DESCRIPTION_LENGTH = 250;

export const useTaskForm = (initialData?: TaskFormData) => {
  const [formState, setFormState] = useState<TaskFormState>({
    assignmentId: initialData?.assignmentId || "",
    description: initialData?.description || "",
    isCompleted: initialData?.isCompleted ?? false,
    errors: {},
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.assignmentId.trim()) {
      newErrors.assignmentId = "Assignment is required";
    }

    if (!formState.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formState.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    setFormState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof Omit<TaskFormState, "errors">, value: unknown) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: "" },
    }));
  };

  const reset = () => {
    setFormState({
      assignmentId: initialData?.assignmentId || "",
      description: initialData?.description || "",
      isCompleted: initialData?.isCompleted ?? false,
      errors: {},
    });
  };

  const reinitialize = (newData: TaskFormData) => {
    setFormState({
      assignmentId: newData.assignmentId,
      description: newData.description,
      isCompleted: newData.isCompleted,
      errors: {},
    });
  };

  const getFormData = (): TaskFormData => ({
    assignmentId: formState.assignmentId,
    description: formState.description,
    isCompleted: formState.isCompleted,
  });

  return {
    formState,
    updateField,
    validateForm,
    reset,
    reinitialize,
    getFormData,
    MAX_DESCRIPTION_LENGTH,
  };
};
