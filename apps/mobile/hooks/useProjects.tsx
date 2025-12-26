import { useProjects as useSharedProjects } from "@taskpro/shared";
import { useAuth } from "./useAuth";
import { useMemo } from "react";

export function useProjects() {
    const { currentUser } = useAuth();
    const sharedProjects = useSharedProjects();

    console.log("useProjects wrapper called", {
        projectsCount: sharedProjects.projects?.length,
        isLoading: sharedProjects.isLoading,
    });

    return useMemo(() => {
        console.log("useProjects memoization triggered");
        return {
            projects: sharedProjects.projects || [],
            isLoading: sharedProjects.isLoading,
            error: sharedProjects.error,
            createProject: sharedProjects.createProject,
            updateProject: sharedProjects.updateProject,
            deleteProject: sharedProjects.deleteProject,
            addMember: sharedProjects.addMember,
            removeMember: sharedProjects.removeMember,
            currentUser,
        };
    }, [
        JSON.stringify(sharedProjects.projects),
        sharedProjects.isLoading,
        sharedProjects.error,
        currentUser?.id,
    ]);
}
