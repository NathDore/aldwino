import { useQuery } from "@tanstack/react-query";
import { fetchWorkSessions } from "../services/workSessionService";

export function useWorkSessionsQuery() {
  return useQuery({ queryKey: ["workSessions"], queryFn: fetchWorkSessions });
}
