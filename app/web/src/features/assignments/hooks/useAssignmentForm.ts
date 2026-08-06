import { useState, useEffect } from "react";
import type { AssignmentDto, AssignmentEditData } from "../types/assignment.types";
import { useUpdateAssignmentMutation } from "../queries/useMutations";
import { isValidTimeFormat, TIME_FORMAT_ERROR } from "@/shared/components/DateTimeField";
import { combineDateAndTime, dateToDateInput, isoToDateInput, isoToTimeInput } from "@/shared/lib/dateTimeForm";

interface FormState {
  courseId: string;
  name: string;
  dueDateDay: string;
  dueDateTime: string;
  errors: Record<string, string>;
}

const NAME_MAX_LENGTH = 250;

function assignmentToFields(assignment: AssignmentDto): Omit<FormState, "errors"> {
  return {
    courseId: assignment.courseId,
    name: assignment.name,
    dueDateDay: isoToDateInput(assignment.dueDate),
    dueDateTime: isoToTimeInput(assignment.dueDate),
  };
}

export function useAssignmentForm(assignmentToEdit: AssignmentDto, onSuccess?: () => void) {
  const [formState, setFormState] = useState<FormState>({ ...assignmentToFields(assignmentToEdit), errors: {} });

  const updateMutation = useUpdateAssignmentMutation();
  const isLoading = updateMutation.isPending;

  useEffect(() => {
    setFormState({ ...assignmentToFields(assignmentToEdit), errors: {} });
  }, [assignmentToEdit]);

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
      const originalDueTime = new Date(assignmentToEdit.dueDate);
      const dueTimeUnchanged = dueDateTimeValue.getTime() === originalDueTime.getTime();
      if (!dueTimeUnchanged && dueDateTimeValue < new Date()) {
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

    const data: AssignmentEditData = {
      courseId: formState.courseId,
      name: formState.name.trim(),
      dueDate,
      assignmentStateId: assignmentToEdit.assignmentStateId,
    };

    try {
      await updateMutation.mutateAsync({ id: assignmentToEdit.id, data });
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
    todayDateInput: dateToDateInput(new Date()),
  };
}
