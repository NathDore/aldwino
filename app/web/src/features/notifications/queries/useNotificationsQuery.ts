import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchNotifications } from "../services/notificationService";

const PAGE_SIZE = 20;
const REFETCH_INTERVAL_MS = 60_000;

export function useNotificationsQuery() {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => fetchNotifications({ limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
