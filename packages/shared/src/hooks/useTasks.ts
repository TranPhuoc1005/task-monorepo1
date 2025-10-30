import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTasksApi, createTaskApi, updateTaskApi, moveTaskApi, deleteTaskApi } from "../api/task.api";
import { Task } from "../types/task";

export function useSharedTasks(supabase: any) {
    const queryClient = useQueryClient();

    const tasksQuery = useQuery({
        queryKey: ["tasks"],
        queryFn: () => listTasksApi(supabase),
    });

    const addTask = useMutation({
        mutationFn: (taskData: Partial<Task>) => createTaskApi(supabase, taskData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const updateTask = useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<Task> }) => updateTaskApi(supabase, id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const moveTask = useMutation({
        mutationFn: ({ id, status }: { id: number; status: Task["status"] }) => moveTaskApi(supabase, id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const deleteTask = useMutation({
        mutationFn: (id: number) => deleteTaskApi(supabase, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    return {
        tasksQuery,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
    };
}
