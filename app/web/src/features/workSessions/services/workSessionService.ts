import { apiClient } from "@/shared/lib/apiClient";
import type {
  WorkSessionDto,
  WorkSessionStateDto,
  CreateWorkSessionData,
  RescheduleWorkSessionData,
  EditWorkSessionData,
} from "../types/workSession.types";

export async function fetchWorkSessions(): Promise<WorkSessionDto[]> {
  return apiClient<WorkSessionDto[]>("/work-sessions");
}

export async function fetchWorkSessionStates(): Promise<WorkSessionStateDto[]> {
  return apiClient<WorkSessionStateDto[]>("/work-session-states");
}

export async function createWorkSession(data: CreateWorkSessionData): Promise<WorkSessionDto> {
  return apiClient<WorkSessionDto>("/work-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function rescheduleWorkSession(id: string, data: RescheduleWorkSessionData): Promise<WorkSessionDto> {
  return apiClient<WorkSessionDto>(`/work-sessions/${id}/reschedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function editWorkSession(id: string, data: EditWorkSessionData): Promise<WorkSessionDto> {
  return apiClient<WorkSessionDto>(`/work-sessions/${id}/edit`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function changeWorkSessionState(id: string, workSessionStateId: string): Promise<WorkSessionDto> {
  return apiClient<WorkSessionDto>(`/work-sessions/${id}/state`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workSessionStateId }),
  });
}

export async function deleteWorkSession(id: string): Promise<void> {
  await apiClient<void>(`/work-sessions/${id}`, { method: "DELETE" });
}

export async function wrapUpWorkSession(id: string): Promise<WorkSessionDto> {
  return apiClient<WorkSessionDto>(`/work-sessions/${id}/wrap-up`, { method: "POST" });
}

export async function fetchWorkSessionCompletionMessage(): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/work-sessions/completion-message");
}
