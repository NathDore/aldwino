import { useQuery } from "@tanstack/react-query";
import { fetchAllAssignmentWorkSessions, fetchAssignmentWorkSessionsForSession } from "../services/assignmentWorkSessionService";

export function useAssignmentWorkSessionsQuery() {
  return useQuery({ queryKey: ["assignmentWorkSessions"], queryFn: fetchAllAssignmentWorkSessions });
}

export function useWorkSessionAssignmentLinksQuery(workSessionId: string) {
  return useQuery({
    queryKey: ["assignmentWorkSessions", workSessionId],
    queryFn: () => fetchAssignmentWorkSessionsForSession(workSessionId),
  });
}
