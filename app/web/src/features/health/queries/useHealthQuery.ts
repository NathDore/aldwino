import { useQuery } from "@tanstack/react-query";
import { fetchHealthStatus } from "../services/healthService";

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealthStatus,
    retry: 3,
    retryDelay: 500,
  });
}
