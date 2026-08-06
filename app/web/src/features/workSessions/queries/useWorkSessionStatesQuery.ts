import { useQuery } from "@tanstack/react-query";
import { fetchWorkSessionStates } from "../services/workSessionService";

export function useWorkSessionStatesQuery() {
  return useQuery({
    queryKey: ["workSessionStates"],
    queryFn: fetchWorkSessionStates,
    staleTime: 60 * 60 * 1000,
  });
}
