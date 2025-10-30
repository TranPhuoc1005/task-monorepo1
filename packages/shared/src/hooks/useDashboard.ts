import { useQuery } from "@tanstack/react-query";
import { Task } from "../types/task";

export interface DashboardStats {
    totalTasks: number;
    inProgress: number;
    completed: number;
    overdue: number;
    totalChange: number;
    inProgressChange: number;
    completedChange: number;
    overdueChange: number;
}

export function useDashboard(supabase: any) {
    const tasksQuery = useQuery({
        queryKey: ["dashboard", "tasks"],
        queryFn: async () => {
            const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });

            if (error) throw error;
            return data as Task[];
        },
        refetchInterval: 30 * 1000,
    });

    const lastWeekTasksQuery = useQuery({
        queryKey: ["dashboard", "last-week-tasks"],
        queryFn: async () => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .lte("created_at", oneWeekAgo.toISOString());

            if (error) throw error;
            return data as Task[];
        },
    });

    const tasks = tasksQuery.data || [];
    const lastWeekTasks = lastWeekTasksQuery.data || [];

    const calculateChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    const stats: DashboardStats = {
        totalTasks: tasks.length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        completed: tasks.filter((t) => t.status === "done").length,
        overdue: tasks.filter((t) => {
            if (!t.due_date) return false;
            return new Date(t.due_date) < new Date() && t.status !== "done";
        }).length,
        totalChange: calculateChange(tasks.length, lastWeekTasks.length),
        inProgressChange: calculateChange(
            tasks.filter((t) => t.status === "in-progress").length,
            lastWeekTasks.filter((t) => t.status === "in-progress").length
        ),
        completedChange: calculateChange(
            tasks.filter((t) => t.status === "done").length,
            lastWeekTasks.filter((t) => t.status === "done").length
        ),
        overdueChange: calculateChange(
            tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length,
            lastWeekTasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length
        ),
    };

    const tasksByStatus = [
        { status: "To Do", count: tasks.filter((t) => t.status === "todo").length, color: "#64748b" },
        { status: "In Progress", count: tasks.filter((t) => t.status === "in-progress").length, color: "#f59e0b" },
        { status: "Review", count: tasks.filter((t) => t.status === "review").length, color: "#3b82f6" },
        { status: "Done", count: tasks.filter((t) => t.status === "done").length, color: "#10b981" },
    ];

    const tasksByPriority = [
        { priority: "Low", count: tasks.filter((t) => t.priority === "low").length, color: "#3b82f6" },
        { priority: "Medium", count: tasks.filter((t) => t.priority === "medium").length, color: "#f59e0b" },
        { priority: "High", count: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
    ];

    const recentTasks = tasks.slice(0, 10);

    return {
        stats,
        tasksByStatus,
        tasksByPriority,
        recentTasks,
        isLoading: tasksQuery.isLoading || lastWeekTasksQuery.isLoading,
        error: tasksQuery.error || lastWeekTasksQuery.error,
    };
}
