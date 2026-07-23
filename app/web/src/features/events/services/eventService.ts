import { apiClient } from "@/shared/lib/apiClient";
import type { EventDto } from "../types/event.types";

export async function fetchEvents(): Promise<EventDto[]> {
  return apiClient<EventDto[]>("/events");
}
