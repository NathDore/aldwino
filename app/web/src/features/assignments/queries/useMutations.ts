import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAssignment, updateAssignment, deleteAssignment, completeAssignment } from "../services/assignmentService";
import type { AssignmentFormData } from "../types/assignment.types";

export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignmentFormData & { isCompleted: boolean } }) =>
      updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useCompleteAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      completeAssignment(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
