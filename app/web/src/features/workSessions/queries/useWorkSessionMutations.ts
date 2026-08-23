import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWorkSession,
  rescheduleWorkSession,
  editWorkSession,
  changeWorkSessionState,
  deleteWorkSession,
  wrapUpWorkSession,
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

export function useChangeWorkSessionStateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, workSessionStateId }: { id: string; workSessionStateId: string }) =>
      changeWorkSessionState(id, workSessionStateId),
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

export function useWrapUpWorkSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wrapUpWorkSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSessions"] });
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}
