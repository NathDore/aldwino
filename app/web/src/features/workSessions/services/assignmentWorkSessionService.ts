import { apiClient } from "@/shared/lib/apiClient";
import type { AssignmentWorkSessionDto } from "../types/assignmentWorkSession.types";

export async function fetchAllAssignmentWorkSessions(): Promise<AssignmentWorkSessionDto[]> {
  return apiClient<AssignmentWorkSessionDto[]>("/assignment-work-sessions");
}

export async function fetchAssignmentWorkSessionsForSession(
  workSessionId: string
): Promise<AssignmentWorkSessionDto[]> {
  return apiClient<AssignmentWorkSessionDto[]>(
    `/assignment-work-sessions?workSessionId=${encodeURIComponent(workSessionId)}`
  );
}

export async function linkAssignmentToWorkSession(data: {
  assignmentId: string;
  workSessionId: string;
}): Promise<AssignmentWorkSessionDto> {
  return apiClient<AssignmentWorkSessionDto>("/assignment-work-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function unlinkAssignmentWorkSession(id: string): Promise<void> {
  await apiClient<void>(`/assignment-work-sessions/${id}`, { method: "DELETE" });
}

export async function markAssignmentWorkedOn(id: string): Promise<AssignmentWorkSessionDto> {
  return apiClient<AssignmentWorkSessionDto>(`/assignment-work-sessions/${id}/mark-worked-on`, { method: "POST" });
}

export async function unmarkAssignmentWorkedOn(id: string): Promise<AssignmentWorkSessionDto> {
  return apiClient<AssignmentWorkSessionDto>(`/assignment-work-sessions/${id}/unmark-worked-on`, { method: "POST" });
}
