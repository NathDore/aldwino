import { useState, useEffect } from "react";
import type { EventDto } from "../types/event.types";
import { useCreateEventMutation, useUpdateEventMutation } from "../queries/useMutations";
import { useEventStore } from "../store/eventStore";

interface FormState {
  date: string;
  startTimeStr: string;
  endTimeStr: string;
  errors: Record<string, string>;
}

const initialFormState: FormState = {
  date: "",
  startTimeStr: "",
  endTimeStr: "",
  errors: {},
};

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function isoToDateAndTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function formStateToFields(eventToEdit: EventDto): Omit<FormState, "errors"> {
  const start = isoToDateAndTime(eventToEdit.startTime);
  const end = isoToDateAndTime(eventToEdit.endTime);
  return { date: start.date, startTimeStr: start.time, endTimeStr: end.time };
}

export function useEventForm(eventToEdit?: EventDto | null) {
  const [formState, setFormState] = useState<FormState>(
    eventToEdit
      ? { ...formStateToFields(eventToEdit), errors: {} }
      : initialFormState
  );

  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();
  const { closeForm } = useEventStore();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (eventToEdit) {
      setFormState({ ...formStateToFields(eventToEdit), errors: {} });
    } else {
      setFormState(initialFormState);
    }
  }, [eventToEdit]);

  const updateField = (field: "date" | "startTimeStr" | "endTimeStr", value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: "" },
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.date) {
      errors.date = "Date is required";
    }

    if (!formState.startTimeStr) {
      errors.startTimeStr = "Start time is required";
    }

    if (!formState.endTimeStr) {
      errors.endTimeStr = "End time is required";
    }

    if (formState.startTimeStr && formState.endTimeStr && formState.startTimeStr >= formState.endTimeStr) {
      errors.endTimeStr = "End time must be after start time";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const startTime = new Date(`${formState.date}T${formState.startTimeStr}`).toISOString();
    const endTime = new Date(`${formState.date}T${formState.endTimeStr}`).toISOString();

    try {
      if (eventToEdit) {
        await updateMutation.mutateAsync({
          id: eventToEdit.id,
          data: { startTime, endTime },
        });
      } else {
        await createMutation.mutateAsync({ startTime, endTime });
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
