import { useQuery } from "@tanstack/react-query";
import { fetchAssignments } from "../services/assignmentService";

export function useAssignmentsQuery() {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: fetchAssignments,
  });
}
