import { apiClient } from "@/shared/lib/apiClient";
import type { AssignmentCreateData, AssignmentDto, AssignmentEditData } from "../types/assignment.types";
import type { AssignmentStateDto } from "../types/assignmentState.types";

export async function fetchAssignments(): Promise<AssignmentDto[]> {
  return apiClient<AssignmentDto[]>("/assignments");
}

export async function createAssignment(data: AssignmentCreateData): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>("/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
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

export async function completeAssignment(id: string): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}/complete`, { method: "POST" });
}

export async function uncompleteAssignment(id: string): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}/uncomplete`, { method: "POST" });
}

export async function rescheduleAssignment(id: string, dueDate: string): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}/reschedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dueDate }),
  });
}

export async function wrapUpAssignment(id: string): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}/wrap-up`, { method: "POST" });
}

export async function wrapUpLateAssignment(id: string): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}/wrap-up-late`, { method: "POST" });
}

export async function confirmCompleteAssignment(id: string): Promise<AssignmentDto> {
  return apiClient<AssignmentDto>(`/assignments/${id}/confirm-complete`, { method: "POST" });
}
