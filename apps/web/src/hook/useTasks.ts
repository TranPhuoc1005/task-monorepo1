"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import { useSharedTasks } from "@taskpro/shared";

export function useTasks() {
    const supabase = createClient();
    const { currentUser } = useAuth();

    const sharedTasks = useSharedTasks(supabase);

    return {
        ...sharedTasks,
        currentUser,
    };
}
