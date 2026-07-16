import { apiClient } from "@/shared/lib/apiClient";
import type { EventDto, EventFormData } from "../types/event.types";

export async function fetchEvents(): Promise<EventDto[]> {
  return apiClient<EventDto[]>("/events");
}

export async function createEvent(data: EventFormData): Promise<EventDto> {
  return apiClient<EventDto>("/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id: string, data: EventFormData): Promise<EventDto> {
  return apiClient<EventDto>(`/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await apiClient<void>(`/events/${id}`, { method: "DELETE" });
}
