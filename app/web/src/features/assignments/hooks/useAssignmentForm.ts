import { useState, useEffect } from "react";
import type { AssignmentDto, AssignmentFormData } from "../types/assignment.types";
import { useCreateAssignmentMutation, useUpdateAssignmentMutation } from "../queries/useMutations";
import { useAssignmentStore } from "../store/assignmentStore";
import { isValidTimeFormat, TIME_FORMAT_ERROR } from "@/shared/components/DateTimeField";

interface FormState {
  courseId: string;
  description: string;
  dueDateDay: string;
  dueDateTime: string;
  startDateDay: string;
  startDateTime: string;
  expectedDurationMinutes: number;
  dueTouched: boolean;
  errors: Record<string, string>;
}

const DESCRIPTION_MAX_LENGTH = 250;

export const ALLOWED_DURATIONS_MINUTES = [15, 25, 50, 60, 90] as const;

const DEFAULT_DUE_TIME = "23:59";

const initialFormState: FormState = {
  courseId: "",
  description: "",
  dueDateDay: "",
  dueDateTime: "",
  startDateDay: "",
  startDateTime: "",
  expectedDurationMinutes: 15,
  dueTouched: false,
  errors: {},
};

function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

function dateToTimeInput(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isoToTimeInput(iso: string): string {
  return dateToTimeInput(new Date(iso));
}

function combineDateAndTime(day: string, time: string): Date {
  return new Date(`${day}T${time}:00`);
}

interface FittingDuration {
  minutes: number | null;
  clamped: boolean;
}

function computeFittingDuration(start: Date, requestedMinutes: number): FittingDuration {
  const midnightNext = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 0, 0, 0, 0);
  const availableMinutes = Math.floor((midnightNext.getTime() - start.getTime()) / 60000);

  if (requestedMinutes < availableMinutes) {
    return { minutes: requestedMinutes, clamped: false };
  }

  const fitting = ALLOWED_DURATIONS_MINUTES.filter((minutes) => minutes < availableMinutes);
  if (fitting.length === 0) {
    return { minutes: null, clamped: true };
  }
  return { minutes: Math.max(...fitting), clamped: true };
}

function assignmentToFields(assignment: AssignmentDto): Omit<FormState, "errors"> {
  return {
    courseId: assignment.courseId,
    description: assignment.description,
    dueDateDay: isoToDateInput(assignment.dueDate),
    dueDateTime: isoToTimeInput(assignment.dueDate),
    startDateDay: isoToDateInput(assignment.startTime),
    startDateTime: isoToTimeInput(assignment.startTime),
    expectedDurationMinutes: assignment.expectedDurationMinutes,
    dueTouched: true,
  };
}

export function useAssignmentForm(assignmentToEdit?: AssignmentDto | null, onSuccess?: () => void) {
  const [formState, setFormState] = useState<FormState>(
    assignmentToEdit ? { ...assignmentToFields(assignmentToEdit), errors: {} } : initialFormState
  );

  const createMutation = useCreateAssignmentMutation();
  const updateMutation = useUpdateAssignmentMutation();
  const { cancelEdit } = useAssignmentStore();
  const selectedStudyDate = useAssignmentStore((s) => s.selectedStudyDate);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (assignmentToEdit) {
      setFormState({ ...assignmentToFields(assignmentToEdit), errors: {} });
    } else {
      setFormState(initialFormState);
    }
  }, [assignmentToEdit]);

  useEffect(() => {
    if (assignmentToEdit) return;
    setFormState((prev) => ({
      ...prev,
      startDateDay: selectedStudyDate,
      errors: { ...prev.errors, startDateDay: "" },
    }));
  }, [assignmentToEdit, selectedStudyDate]);

  const updateField = (
    field: keyof Omit<FormState, "errors" | "expectedDurationMinutes" | "dueTouched">,
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      dueTouched: field === "dueDateDay" || field === "dueDateTime" ? true : prev.dueTouched,
      errors: { ...prev.errors, [field]: "" },
    }));
  };

  const updateDuration = (minutes: number) => {
    setFormState((prev) => ({
      ...prev,
      expectedDurationMinutes: minutes,
      errors: { ...prev.errors, expectedDurationMinutes: "" },
    }));
  };

  useEffect(() => {
    setFormState((prev) => {
      if (prev.dueTouched || prev.startDateDay === "") {
        return prev;
      }
      if (prev.dueDateDay === prev.startDateDay && prev.dueDateTime === DEFAULT_DUE_TIME) {
        return prev;
      }

      return {
        ...prev,
        dueDateDay: prev.startDateDay,
        dueDateTime: DEFAULT_DUE_TIME,
        errors: { ...prev.errors, dueDateDay: "", dueDateTime: "" },
      };
    });
  }, [formState.startDateDay]);

  const hasValidStart = formState.startDateDay !== "" && isValidTimeFormat(formState.startDateTime);
  const startDateTimeValue = hasValidStart
    ? combineDateAndTime(formState.startDateDay, formState.startDateTime)
    : null;
  const fittingDuration: FittingDuration = startDateTimeValue
    ? computeFittingDuration(startDateTimeValue, formState.expectedDurationMinutes)
    : { minutes: formState.expectedDurationMinutes, clamped: false };
  const effectiveEndTime =
    startDateTimeValue && fittingDuration.minutes !== null
      ? new Date(startDateTimeValue.getTime() + fittingDuration.minutes * 60000)
      : null;
  const wasClamped = fittingDuration.clamped && fittingDuration.minutes !== null;
  const noFittingDuration = startDateTimeValue !== null && fittingDuration.minutes === null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.courseId) {
      errors.courseId = "Course is required";
    }

    if (!formState.description.trim()) {
      errors.description = "Description is required";
    } else if (formState.description.trim().length > DESCRIPTION_MAX_LENGTH) {
      errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer`;
    }

    if (!formState.dueDateDay) {
      errors.dueDateDay = "Due date is required";
    }
    if (!formState.dueDateTime) {
      errors.dueDateTime = "Due time is required";
    } else if (!isValidTimeFormat(formState.dueDateTime)) {
      errors.dueDateTime = TIME_FORMAT_ERROR;
    }

    if (!formState.startDateDay) {
      errors.startDateDay = "Start date is required";
    }
    if (!formState.startDateTime) {
      errors.startDateTime = "Start time is required";
    } else if (!isValidTimeFormat(formState.startDateTime)) {
      errors.startDateTime = TIME_FORMAT_ERROR;
    }

    if (
      !ALLOWED_DURATIONS_MINUTES.includes(
        formState.expectedDurationMinutes as (typeof ALLOWED_DURATIONS_MINUTES)[number]
      )
    ) {
      errors.expectedDurationMinutes = "Duration must be one of the allowed options";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (fittingDuration.minutes === null) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          expectedDurationMinutes: "No session length fits before midnight — choose an earlier start time.",
        },
      }));
      return;
    }

    const dueDate = combineDateAndTime(formState.dueDateDay, formState.dueDateTime).toISOString();
    const startDateTime = combineDateAndTime(formState.startDateDay, formState.startDateTime);
    const startTime = startDateTime.toISOString();
    const expectedDurationMinutes = fittingDuration.minutes;

    const data: AssignmentFormData = {
      courseId: formState.courseId,
      description: formState.description.trim(),
      dueDate,
      startTime,
      expectedDurationMinutes,
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
      setFormState(initialFormState);
      cancelEdit();
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
    updateDuration,
    handleSubmit,
    isLoading,
    effectiveEndTime,
    effectiveDurationMinutes: fittingDuration.minutes,
    wasClamped,
    noFittingDuration,
  };
}
