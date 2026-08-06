import { useEffect, useState } from "react";
import { useCreateWorkSessionMutation } from "../queries/useWorkSessionMutations";
import { validateStartNotInPast, validateSameCalendarDay } from "../utils/workSessionValidation";
import { isValidTimeFormat, TIME_FORMAT_ERROR } from "@/shared/components/DateTimeField";
import {
  ALLOWED_DURATIONS_MINUTES,
  combineDateAndTime,
  computeFittingDuration,
  dateToDateInput,
  type FittingDuration,
} from "@/shared/lib/dateTimeForm";

interface FormState {
  startDateDay: string;
  startDateTime: string;
  durationMinutes: number;
  errors: Record<string, string>;
}

const initialFormState: FormState = {
  startDateDay: "",
  startDateTime: "",
  durationMinutes: 25,
  errors: {},
};

// The backend rejects any startTime strictly before its own clock at request time, so a
// literal "now" captured on submit always loses that race to network/processing latency.
const START_NOW_SUBMIT_BUFFER_MS = 5000;

export function useWorkSessionForm(onSuccess?: () => void, date?: string, hour?: number, useCurrentTimeAsStart?: boolean) {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const createMutation = useCreateWorkSessionMutation();
  const isLoading = createMutation.isPending;

  useEffect(() => {
    if (date === undefined || hour === undefined) return;
    const time = useCurrentTimeAsStart ? nowTimeInput() : hourToTimeInput(hour);
    setFormState((prev) => ({
      ...prev,
      startDateDay: date,
      startDateTime: time,
      errors: { ...prev.errors, startDateDay: "", startDateTime: "" },
    }));
  }, [date, hour, useCurrentTimeAsStart]);

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

    if (!errors.startDateDay && !errors.startDateTime && effectiveEndTime) {
      const startValue = useCurrentTimeAsStart
        ? new Date(Date.now() + START_NOW_SUBMIT_BUFFER_MS)
        : combineDateAndTime(formState.startDateDay, formState.startDateTime);
      const pastError = useCurrentTimeAsStart ? undefined : validateStartNotInPast(startValue);
      if (pastError) {
        errors.submit = pastError;
      } else {
        const dayError = validateSameCalendarDay(startValue, effectiveEndTime);
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

    const startDateTime = useCurrentTimeAsStart
      ? new Date(Date.now() + START_NOW_SUBMIT_BUFFER_MS)
      : combineDateAndTime(formState.startDateDay, formState.startDateTime);
    const endDateTime = new Date(startDateTime.getTime() + fittingDuration.minutes * 60000);

    try {
      await createMutation.mutateAsync({
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });
      setFormState(initialFormState);
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

function hourToTimeInput(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function nowTimeInput(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
