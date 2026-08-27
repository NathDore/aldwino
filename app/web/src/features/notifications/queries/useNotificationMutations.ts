import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationRead } from "../services/notificationService";

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
