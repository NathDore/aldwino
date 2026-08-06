import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAssignment, deleteAssignment, changeAssignmentState } from "../services/assignmentService";
import type { AssignmentEditData } from "../types/assignment.types";

export function useUpdateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignmentEditData }) => updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useDeleteAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useChangeAssignmentStateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignmentStateId }: { id: string; assignmentStateId: string }) =>
      changeAssignmentState(id, assignmentStateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}
