import { useQuery } from "@tanstack/react-query";
import { fetchAllowedColors } from "../services/courseService";

export function useAllowedColorsQuery() {
  return useQuery({
    queryKey: ["courses", "colors"],
    queryFn: fetchAllowedColors,
    staleTime: 60 * 60 * 1000,
  });
}
