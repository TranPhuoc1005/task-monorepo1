import { createClient } from "../lib/supabase/client";
import { Task } from "../types";

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

export interface DashboardData {
    stats: DashboardStats;
    tasksByStatus: { status: string; count: number }[];
    tasksByPriority: { priority: string; count: number }[];
    recentTasks: Task[];
}

export const getDashboardDataApi = async (): Promise<DashboardData> => {
    const supabase = createClient();

    const { data, error } = await supabase.from("tasks").select("*");
    if (error) throw error;

    const tasks: Task[] = data || [];

    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter((t) => t.status === "overdue").length;

    const tasksByStatus = [
        { status: "To Do", count: tasks.filter((t) => t.status === "todo").length },
        { status: "In Progress", count: inProgress },
        { status: "Review", count: tasks.filter((t) => t.status === "review").length },
        { status: "Done", count: completed },
    ];

    const tasksByPriority = [
        { priority: "Low", count: tasks.filter((t) => t.priority === "low").length },
        { priority: "Medium", count: tasks.filter((t) => t.priority === "medium").length },
        { priority: "High", count: tasks.filter((t) => t.priority === "high").length },
    ];

    const recentTasks: Task[] = tasks.slice(0, 5);

    return {
        stats: {
            totalTasks: total,
            inProgress,
            completed,
            overdue,
            totalChange: 0,
            inProgressChange: 0,
            completedChange: 0,
            overdueChange: 0,
        },
        tasksByStatus,
        tasksByPriority,
        recentTasks,
    };
};
