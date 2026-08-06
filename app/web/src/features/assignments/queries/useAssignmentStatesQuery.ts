import { useQuery } from "@tanstack/react-query";
import { fetchAssignmentStates } from "../services/assignmentService";

export function useAssignmentStatesQuery() {
  return useQuery({
    queryKey: ["assignmentStates"],
    queryFn: fetchAssignmentStates,
    staleTime: 60 * 60 * 1000,
  });
}
