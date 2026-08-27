import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  completeAssignment,
  uncompleteAssignment,
  rescheduleAssignment,
  wrapUpAssignment,
  wrapUpLateAssignment,
  confirmCompleteAssignment,
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

export function useCompleteAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useConfirmCompleteAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmCompleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUncompleteAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uncompleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useRescheduleAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dueDate }: { id: string; dueDate: string }) => rescheduleAssignment(id, dueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
