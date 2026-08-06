import { apiClient } from "@/shared/lib/apiClient";
import type { AssignmentDto, AssignmentEditData } from "../types/assignment.types";
import type { AssignmentStateDto } from "../types/assignmentState.types";

export async function fetchAssignments(): Promise<AssignmentDto[]> {
  return apiClient<AssignmentDto[]>("/assignments");
}

export async function fetchAssignmentStates(): Promise<AssignmentStateDto[]> {
  return apiClient<AssignmentStateDto[]>("/assignment-states");
}

export async function updateAssignment(id: string, data: AssignmentEditData): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiClient<void>(`/assignments/${id}`, { method: "DELETE" });
}

export async function changeAssignmentState(id: string, assignmentStateId: string): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}/state`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignmentStateId }),
  });
}
