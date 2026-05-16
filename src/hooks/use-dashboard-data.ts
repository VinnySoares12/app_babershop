import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLoyaltySummary,
  getUnreadNotificationsCount,
  listNotifications,
  listRecentHistory,
  markNotificationAsRead,
} from "@/services/client/dashboard";

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["dashboard", "notifications", "unread-count"],
    queryFn: getUnreadNotificationsCount,
    refetchInterval: 15000,
  });
}

export function useNotificationsFeed() {
  return useQuery({
    queryKey: ["dashboard", "notifications", "feed"],
    queryFn: listNotifications,
    refetchInterval: 15000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "notifications", "feed"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "notifications", "unread-count"] }),
      ]);
    },
  });
}

export function useLoyaltySummary() {
  return useQuery({
    queryKey: ["dashboard", "loyalty", "summary"],
    queryFn: getLoyaltySummary,
  });
}

export function useRecentHistory() {
  return useQuery({
    queryKey: ["dashboard", "recent-history"],
    queryFn: listRecentHistory,
  });
}
