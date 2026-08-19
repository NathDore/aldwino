import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  changeAssignmentState,
  wrapUpAssignment,
  wrapUpLateAssignment,
} from "../services/assignmentService";
import type { AssignmentEditData } from "../types/assignment.types";

export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

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

export function useWrapUpAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wrapUpAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useWrapUpLateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wrapUpLateAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}
