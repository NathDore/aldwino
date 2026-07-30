import { apiClient } from "@/shared/lib/apiClient";
import type { AssignmentDto, AssignmentFormData } from "../types/assignment.types";

export async function fetchAssignments(): Promise<AssignmentDto[]> {
  return apiClient<AssignmentDto[]>("/assignments");
}

export async function createAssignment(data: AssignmentFormData): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>("/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateAssignment(
  id: string,
  data: AssignmentFormData & { isCompleted: boolean }
): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiClient<void>(`/assignments/${id}`, { method: "DELETE" });
}

export async function completeAssignment(id: string, isCompleted: boolean): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isCompleted }),
  });
}
