"use client";

import { useAuth } from "./useAuth";
import { useTasks as useSharedTasks } from "@taskpro/shared";

export function useTasks() {
    const { currentUser } = useAuth();

    const sharedTasks = useSharedTasks();

    return {
        ...sharedTasks,
        currentUser,
    };
}
