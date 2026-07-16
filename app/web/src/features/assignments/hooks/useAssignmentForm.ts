import { useState, useEffect } from "react";
import type { AssignmentDto, AssignmentFormData } from "../types/assignment.types";
import { useCreateAssignmentMutation, useUpdateAssignmentMutation } from "../queries/useMutations";
import { useAssignmentStore } from "../store/assignmentStore";

interface FormState extends AssignmentFormData {
  errors: Record<string, string>;
}

const DESCRIPTION_MAX_LENGTH = 250;

const initialFormState: FormState = {
  courseId: "",
  eventId: "",
  description: "",
  dueDate: "",
  errors: {},
};

function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

function assignmentToFields(assignment: AssignmentDto): Omit<FormState, "errors"> {
  return {
    courseId: assignment.courseId,
    eventId: assignment.eventId,
    description: assignment.description,
    dueDate: isoToDateInput(assignment.dueDate),
  };
}

export function useAssignmentForm(assignmentToEdit?: AssignmentDto | null) {
  const [formState, setFormState] = useState<FormState>(
    assignmentToEdit ? { ...assignmentToFields(assignmentToEdit), errors: {} } : initialFormState
  );

  const createMutation = useCreateAssignmentMutation();
  const updateMutation = useUpdateAssignmentMutation();
  const { closeForm } = useAssignmentStore();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (assignmentToEdit) {
      setFormState({ ...assignmentToFields(assignmentToEdit), errors: {} });
    } else {
      setFormState(initialFormState);
    }
  }, [assignmentToEdit]);

  const updateField = (field: keyof AssignmentFormData, value: string) => {
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

    if (!formState.eventId) {
      errors.eventId = "Event is required";
    }

    if (!formState.description.trim()) {
      errors.description = "Description is required";
    } else if (formState.description.trim().length > DESCRIPTION_MAX_LENGTH) {
      errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer`;
    }

    if (!formState.dueDate) {
      errors.dueDate = "Due date is required";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const dueDate = new Date(`${formState.dueDate}T00:00:00`).toISOString();
    const data: AssignmentFormData = {
      courseId: formState.courseId,
      eventId: formState.eventId,
      description: formState.description.trim(),
      dueDate,
    };

    try {
      if (assignmentToEdit) {
        await updateMutation.mutateAsync({
          id: assignmentToEdit.id,
          data: { ...data, isCompleted: assignmentToEdit.isCompleted },
        });
      } else {
        await createMutation.mutateAsync(data);
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
  };
}
