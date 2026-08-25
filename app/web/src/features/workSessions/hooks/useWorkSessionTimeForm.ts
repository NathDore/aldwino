import { useState } from "react";
import type { WorkSessionDto } from "../types/workSession.types";
import {
  useRescheduleWorkSessionMutation,
  useEditWorkSessionMutation,
  useChangeWorkSessionStateMutation,
} from "../queries/useWorkSessionMutations";
import { useWorkSessionStatesQuery } from "../queries/useWorkSessionStatesQuery";
import { validateStartNotInPast, validateSameCalendarDay } from "../utils/workSessionValidation";
import { isValidTimeFormat, TIME_FORMAT_ERROR } from "@/shared/components/DateTimeField";
import {
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  combineDateAndTime,
  computeFittingDuration,
  dateToDateInput,
  isValidDurationMinutes,
  isoToDateInput,
  isoToTimeInput,
  type FittingDuration,
} from "@/shared/lib/dateTimeForm";

export type WorkSessionTimeFormMode = "edit" | "reschedule";

interface WorkSessionTimeFormState {
  startDateDay: string;
  startDateTime: string;
  durationMinutes: number;
  errors: Record<string, string>;
}

export function useWorkSessionTimeForm(
  workSession: WorkSessionDto,
  mode: WorkSessionTimeFormMode,
  onSuccess?: (newStart: Date) => void
) {
  const isReschedule = mode === "reschedule";

  const currentDurationMinutes = Math.round(
    (new Date(workSession.endTime).getTime() - new Date(workSession.startTime).getTime()) / 60000
  );

  const defaultStartDate = isReschedule
    ? dateToDateInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    : isoToDateInput(workSession.startTime);

  const [formState, setFormState] = useState<WorkSessionTimeFormState>({
    startDateDay: defaultStartDate,
    startDateTime: isoToTimeInput(workSession.startTime),
    durationMinutes: Math.min(MAX_DURATION_MINUTES, Math.max(MIN_DURATION_MINUTES, currentDurationMinutes)),
    errors: {},
  });

  const rescheduleMutation = useRescheduleWorkSessionMutation();
  const editMutation = useEditWorkSessionMutation();
  const stateMutation = useChangeWorkSessionStateMutation();
  const { data: workSessionStates } = useWorkSessionStatesQuery();
  const isLoading = rescheduleMutation.isPending || editMutation.isPending || stateMutation.isPending;

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
      if (isReschedule) {
        const pastError = validateStartNotInPast(startDateTimeValue);
        if (pastError) {
          errors.submit = pastError;
        }
      }
      if (!errors.submit) {
        const dayError = validateSameCalendarDay(startDateTimeValue, effectiveEndTime);
        if (dayError) {
          errors.submit = dayError;
        }
      }
    }

    if (!isValidDurationMinutes(formState.durationMinutes)) {
      errors.durationMinutes = "Duration must be between 1 and 480 minutes";
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
      if (isReschedule) {
        await rescheduleMutation.mutateAsync({
          id: workSession.id,
          data: { startTime: startTime.toISOString(), endTime: endTime.toISOString() },
        });
        const inProgressStateId = workSessionStates?.find((s) => s.state === "INPROGRESS")?.id;
        if (inProgressStateId) {
          await stateMutation.mutateAsync({ id: workSession.id, workSessionStateId: inProgressStateId });
        }
      } else {
        await editMutation.mutateAsync({
          id: workSession.id,
          data: { startTime: startTime.toISOString(), endTime: endTime.toISOString() },
        });
      }
      onSuccess?.(startTime);
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
