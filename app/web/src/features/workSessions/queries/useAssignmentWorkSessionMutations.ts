import { useMutation, useQueryClient } from "@tanstack/react-query";
import { linkAssignmentToWorkSession, unlinkAssignmentWorkSession } from "../services/assignmentWorkSessionService";

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
