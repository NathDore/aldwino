import { useQuery } from "@tanstack/react-query";
import { fetchNotificationById } from "../services/notificationService";

export function useNotificationQuery(id: string) {
  return useQuery({
    queryKey: ["notifications", id],
    queryFn: () => fetchNotificationById(id),
  });
}
