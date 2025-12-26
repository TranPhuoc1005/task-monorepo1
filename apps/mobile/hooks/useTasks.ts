import { useTasks as useSharedTasks } from "@taskpro/shared";
import { useAuth } from "./useAuth";

export function useTasks() {
    const { currentUser } = useAuth();
    const sharedTasks = useSharedTasks();
    
    console.log('useTasks wrapper - sharedTasks:', {
        tasks: sharedTasks.tasks?.length || 0,
        isLoading: sharedTasks.isLoading,
        isError: sharedTasks.isError
    });
    
    return {
        ...sharedTasks,
        currentUser,
    };
}