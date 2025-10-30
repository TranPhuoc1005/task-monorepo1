import { useQuery } from "@tanstack/react-query";
import { getNotificationsApi } from "../api/notification.api";

export function useNotifications(supabase: any) {
    const { data, error, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => getNotificationsApi(supabase),
        refetchInterval: 30 * 1000,
    });

    return {
        dueSoonTasks: data?.dueSoonTasks || [],
        recentActivities: data?.recentActivities || [],
        totalNotifications: data?.totalNotifications || 0,
        isLoading,
        isFetching,
        error,
        refetch,
    };
}
