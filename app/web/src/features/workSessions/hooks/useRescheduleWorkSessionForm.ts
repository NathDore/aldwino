import { useState } from "react";
import type { WorkSessionDto } from "../types/workSession.types";
import { useRescheduleWorkSessionMutation } from "../queries/useWorkSessionMutations";
import { validateStartNotInPast, validateSameCalendarDay } from "../utils/workSessionValidation";
import { isValidTimeFormat, TIME_FORMAT_ERROR } from "@/shared/components/DateTimeField";
import {
  ALLOWED_DURATIONS_MINUTES,
  combineDateAndTime,
  computeFittingDuration,
  dateToDateInput,
  isoToDateInput,
  isoToTimeInput,
  type FittingDuration,
} from "@/shared/lib/dateTimeForm";

interface RescheduleFormState {
  startDateDay: string;
  startDateTime: string;
  durationMinutes: number;
  errors: Record<string, string>;
}

function closestAllowedDuration(minutes: number): number {
  return ALLOWED_DURATIONS_MINUTES.reduce((closest, candidate) =>
    Math.abs(candidate - minutes) < Math.abs(closest - minutes) ? candidate : closest
  );
}

export function useRescheduleWorkSessionForm(workSession: WorkSessionDto, onSuccess?: () => void) {
  const currentDurationMinutes = Math.round(
    (new Date(workSession.endTime).getTime() - new Date(workSession.startTime).getTime()) / 60000
  );

  const [formState, setFormState] = useState<RescheduleFormState>({
    startDateDay: isoToDateInput(workSession.startTime),
    startDateTime: isoToTimeInput(workSession.startTime),
    durationMinutes: closestAllowedDuration(currentDurationMinutes),
    errors: {},
  });

  const rescheduleMutation = useRescheduleWorkSessionMutation();
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
      durationMinutes: minutes,
      errors: { ...prev.errors, durationMinutes: "" },
    }));
  };

  const hasValidStart = formState.startDateDay !== "" && isValidTimeFormat(formState.startDateTime);
  const startDateTimeValue = hasValidStart
    ? combineDateAndTime(formState.startDateDay, formState.startDateTime)
    : null;
  const fittingDuration: FittingDuration = startDateTimeValue
    ? computeFittingDuration(startDateTimeValue, formState.durationMinutes)
    : { minutes: formState.durationMinutes, clamped: false };
  const effectiveEndTime =
    startDateTimeValue && fittingDuration.minutes !== null
      ? new Date(startDateTimeValue.getTime() + fittingDuration.minutes * 60000)
      : null;
  const wasClamped = fittingDuration.clamped && fittingDuration.minutes !== null;
  const noFittingDuration = startDateTimeValue !== null && fittingDuration.minutes === null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.startDateDay) {
      errors.startDateDay = "Start date is required";
    }
    if (!formState.startDateTime) {
      errors.startDateTime = "Start time is required";
    } else if (!isValidTimeFormat(formState.startDateTime)) {
      errors.startDateTime = TIME_FORMAT_ERROR;
    }

    if (!errors.startDateDay && !errors.startDateTime && effectiveEndTime && startDateTimeValue) {
      const pastError = validateStartNotInPast(startDateTimeValue);
      if (pastError) {
        errors.submit = pastError;
      } else {
        const dayError = validateSameCalendarDay(startDateTimeValue, effectiveEndTime);
        if (dayError) {
          errors.submit = dayError;
        }
      }
    }

    if (!ALLOWED_DURATIONS_MINUTES.includes(formState.durationMinutes as (typeof ALLOWED_DURATIONS_MINUTES)[number])) {
      errors.durationMinutes = "Duration must be one of the allowed options";
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
          durationMinutes: "No session length fits before midnight — choose an earlier start time.",
        },
      }));
      return;
    }

    const startTime = combineDateAndTime(formState.startDateDay, formState.startDateTime);
    const endTime = new Date(startTime.getTime() + fittingDuration.minutes * 60000);

    try {
      await rescheduleMutation.mutateAsync({
        id: workSession.id,
        data: { startTime: startTime.toISOString(), endTime: endTime.toISOString() },
      });
      onSuccess?.();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFormState((prev) => ({ ...prev, errors: { submit: error.message } }));
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
    wasClamped,
    noFittingDuration,
    todayDateInput: dateToDateInput(new Date()),
  };
}
