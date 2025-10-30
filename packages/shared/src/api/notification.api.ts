import { NotificationsResponse } from "../types/notifications";

export const getNotificationsApi = async (supabase: any): Promise<NotificationsResponse> => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const today = new Date().toISOString().split("T")[0];

    const { data: dueSoonTasks, error: dueSoonError } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "done")
        .gte("due_date", today)
        .lte("due_date", tomorrow.toISOString().split("T")[0])
        .order("due_date", { ascending: true });

    if (dueSoonError) throw dueSoonError;

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: activities, error: activitiesError } = await supabase
        .from("task_activities")
        .select(`*, task:tasks(*)`)
        .gte("created_at", oneHourAgo.toISOString())
        .order("created_at", { ascending: false });

    if (activitiesError) throw activitiesError;

    return {
        dueSoonTasks: dueSoonTasks || [],
        recentActivities: activities || [],
        totalNotifications: (dueSoonTasks?.length || 0) + (activities?.length || 0),
    };
};
