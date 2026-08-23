import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  linkAssignmentToWorkSession,
  unlinkAssignmentWorkSession,
  markAssignmentWorkedOn,
  unmarkAssignmentWorkedOn,
} from "../services/assignmentWorkSessionService";

export function useLinkAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { assignmentId: string; workSessionId: string }) => linkAssignmentToWorkSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useUnlinkAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlinkAssignmentWorkSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useMarkWorkedOnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAssignmentWorkedOn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}

export function useUnmarkWorkedOnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unmarkAssignmentWorkedOn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignmentWorkSessions"] });
    },
  });
}
