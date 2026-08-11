import { useState } from "react";
import type { AssignmentCreateData, AssignmentDto } from "../types/assignment.types";
import { useCreateAssignmentMutation } from "../queries/useMutations";
import { isValidTimeFormat, TIME_FORMAT_ERROR } from "@/shared/components/DateTimeField";
import { combineDateAndTime, dateToDateInput } from "@/shared/lib/dateTimeForm";

interface FormState {
  courseId: string;
  name: string;
  dueDateDay: string;
  dueDateTime: string;
  errors: Record<string, string>;
}

const NAME_MAX_LENGTH = 250;

const initialFormState: FormState = {
  courseId: "",
  name: "",
  dueDateDay: "",
  dueDateTime: "",
  errors: {},
};

export function useCreateAssignmentForm(onCreated: (assignment: AssignmentDto) => void) {
  const [formState, setFormState] = useState<FormState>(initialFormState);

  const createMutation = useCreateAssignmentMutation();
  const isLoading = createMutation.isPending;

  const updateField = (field: keyof Omit<FormState, "errors">, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: "" },
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.courseId) {
      errors.courseId = "Course is required";
    }

    if (!formState.name.trim()) {
      errors.name = "Name is required";
    } else if (formState.name.trim().length > NAME_MAX_LENGTH) {
      errors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer`;
    }

    if (!formState.dueDateDay) {
      errors.dueDateDay = "Due date is required";
    }
    if (!formState.dueDateTime) {
      errors.dueDateTime = "Due time is required";
    } else if (!isValidTimeFormat(formState.dueDateTime)) {
      errors.dueDateTime = TIME_FORMAT_ERROR;
    }
    if (!errors.dueDateDay && !errors.dueDateTime) {
      const dueDateTimeValue = combineDateAndTime(formState.dueDateDay, formState.dueDateTime);
      if (dueDateTimeValue < new Date()) {
        errors.dueDateTime = "Due date cannot be in the past";
      }
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const dueDate = combineDateAndTime(formState.dueDateDay, formState.dueDateTime).toISOString();

    const data: AssignmentCreateData = {
      courseId: formState.courseId,
      name: formState.name.trim(),
      dueDate,
    };

    try {
      const assignment = await createMutation.mutateAsync(data);
      setFormState(initialFormState);
      onCreated(assignment);
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
    todayDateInput: dateToDateInput(new Date()),
  };
}
