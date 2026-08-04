import { useState } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import { useRescheduleAssignmentMutation } from "../queries/useMutations";
import { isValidTimeFormat, TIME_FORMAT_ERROR } from "@/shared/components/DateTimeField";
import {
  ALLOWED_DURATIONS_MINUTES,
  computeFittingDuration,
  combineDateAndTime,
  dateToDateInput,
  isoToDateInput,
  isoToTimeInput,
  type FittingDuration,
} from "./useAssignmentForm";

interface RescheduleFormState {
  startDateDay: string;
  startDateTime: string;
  expectedDurationMinutes: number;
  errors: Record<string, string>;
}

export function useRescheduleForm(assignment: AssignmentDto, onSuccess?: () => void) {
  const [formState, setFormState] = useState<RescheduleFormState>({
    startDateDay: isoToDateInput(assignment.startTime),
    startDateTime: isoToTimeInput(assignment.startTime),
    expectedDurationMinutes: assignment.expectedDurationMinutes,
    errors: {},
  });

  const rescheduleMutation = useRescheduleAssignmentMutation();
  const isLoading = rescheduleMutation.isPending;

  const updateField = (field: "startDateDay" | "startDateTime", value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
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

  const originalStartTime = new Date(assignment.startTime);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const now = new Date();

    if (!formState.startDateDay) {
      errors.startDateDay = "Start date is required";
    }
    if (!formState.startDateTime) {
      errors.startDateTime = "Start time is required";
    } else if (!isValidTimeFormat(formState.startDateTime)) {
      errors.startDateTime = TIME_FORMAT_ERROR;
    }
    if (!errors.startDateDay && !errors.startDateTime) {
      const startDateTimeValue = combineDateAndTime(formState.startDateDay, formState.startDateTime);
      const startTimeUnchanged = startDateTimeValue.getTime() === originalStartTime.getTime();
      if (!startTimeUnchanged && startDateTimeValue < now) {
        errors.submit = "Start time cannot be in the past";
      }
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

    const startTime = combineDateAndTime(formState.startDateDay, formState.startDateTime).toISOString();
    const expectedDurationMinutes = fittingDuration.minutes;

    try {
      await rescheduleMutation.mutateAsync({
        id: assignment.id,
        data: { startTime, expectedDurationMinutes },
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
    updateDuration,
    handleSubmit,
    isLoading,
    effectiveEndTime,
    effectiveDurationMinutes: fittingDuration.minutes,
    wasClamped,
    noFittingDuration,
    todayDateInput: dateToDateInput(new Date()),
  };
}
