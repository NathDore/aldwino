import { useQuery } from "@tanstack/react-query";
import { fetchWorkSessionCompletionMessage } from "../services/workSessionService";

export function useWorkSessionCompletionMessageQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["workSessionCompletionMessage"],
    queryFn: fetchWorkSessionCompletionMessage,
    enabled,
    staleTime: 0,
    retry: false,
  });
}
