import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../services/eventService";

export function useEventsQuery() {
  return useQuery({ queryKey: ["events"], queryFn: fetchEvents });
}
