import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWorkSession,
  rescheduleWorkSession,
  editWorkSession,
  completeWorkSession,
  uncompleteWorkSession,
  deleteWorkSession,
  closeWorkSession,
} from "../services/workSessionService";
import type { CreateWorkSessionData, RescheduleWorkSessionData, EditWorkSessionData } from "../types/workSession.types";

export function useCreateWorkSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkSessionData) => createWorkSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSessions"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useRescheduleWorkSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleWorkSessionData }) => rescheduleWorkSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSessions"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useEditWorkSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditWorkSessionData }) => editWorkSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSessions"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useCompleteWorkSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeWorkSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSessions"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useUncompleteWorkSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uncompleteWorkSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSessions"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useDeleteWorkSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSessions"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useCloseWorkSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeWorkSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSessions"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}
