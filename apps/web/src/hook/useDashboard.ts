"use client";
import { useDashboard as useSharedDashboard } from "@taskpro/shared";

export function useDashboard() {
    const query = useSharedDashboard();

    return {
        stats: query.data?.stats,
        tasksByStatus: query.data?.tasksByStatus ?? [],
        tasksByPriority: query.data?.tasksByPriority ?? [],
        recentTasks: query.data?.recentTasks ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}