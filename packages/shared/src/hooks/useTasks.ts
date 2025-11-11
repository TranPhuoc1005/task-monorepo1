import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import {
    listTasksApi,
    getTaskByIdApi,
    createTaskApi,
    updateTaskApi,
    moveTaskApi,
    deleteTaskApi,
    updateDueDateApi,
} from "../api/task.api";

export function useTasks() {
    const queryClient = useQueryClient();
    const { currentUser } = useAuth();

    const tasksQuery = useQuery({
        queryKey: ["tasks"],
        queryFn: listTasksApi,
        enabled: !!currentUser,
    });

    const createTask = useMutation({
        mutationFn: createTaskApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const updateTask = useMutation({
        mutationFn: updateTaskApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const moveTask = useMutation({
        mutationFn: moveTaskApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const deleteTask = useMutation({
        mutationFn: deleteTaskApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const updateDueDate = useMutation({
        mutationFn: ({ id, due_date }: { id: number; due_date: string }) => updateDueDateApi(id, due_date),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    return {
        tasks: tasksQuery.data || [],
        isLoading: tasksQuery.isLoading,
        error: tasksQuery.error,
        createTask,
        updateTask,
        moveTask,
        deleteTask,
    };
}

export function useTask(id: number) {
    return useQuery({
        queryKey: ["tasks", id],
        queryFn: () => getTaskByIdApi(id),
        enabled: !!id,
    });
}