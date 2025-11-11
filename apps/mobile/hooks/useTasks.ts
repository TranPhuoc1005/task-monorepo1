import { useSharedTasks } from "@taskpro/shared/hooks/useTasks";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export function useTasks() {
    const { currentUser } = useAuth();
    const sharedTasks = useSharedTasks(supabase);
    
    return {
        ...sharedTasks,
        currentUser,
    };
}