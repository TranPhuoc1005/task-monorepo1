import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsersApi, updateUserRoleApi, removeUserApi } from "../api/user.api";
import {
    listTeamsApi,
    listTeamMembersApi,
    assignTeamMemberApi,
    updateTeamMemberRoleApi,
    removeTeamMemberApi,
} from "../api/team.api";

export function useAdminUsers(supabase: any, currentUser: any) {
    const queryClient = useQueryClient();

    const usersQuery = useQuery({
        queryKey: ["users"],
        queryFn: () => listUsersApi(supabase),
        enabled: !!currentUser,
    });

    const teamsQuery = useQuery({
        queryKey: ["teams"],
        queryFn: () => listTeamsApi(supabase),
        enabled: !!currentUser,
    });

    const teamMembersQuery = useQuery({
        queryKey: ["team-members"],
        queryFn: () => listTeamMembersApi(supabase),
        enabled: !!currentUser,
    });

    const updateRole = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) => updateUserRoleApi(supabase, userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    const removeUser = useMutation({
        mutationFn: (userId: string) => removeUserApi(supabase, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    const assignTeam = useMutation({
        mutationFn: ({
            userId,
            teamId,
            role = "member",
        }: {
            userId: string;
            teamId: string;
            role?: "team_lead" | "member";
        }) => assignTeamMemberApi(supabase, userId, teamId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    const removeTeam = useMutation({
        mutationFn: (membershipId: string) => removeTeamMemberApi(supabase, membershipId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    const updateMemberRole = useMutation({
        mutationFn: ({ membershipId, role }: { membershipId: string; role: "team_lead" | "member" }) =>
            updateTeamMemberRoleApi(supabase, membershipId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    return {
        users: usersQuery.data || [],
        teams: teamsQuery.data || [],
        teamMembers: teamMembersQuery.data || [],
        isLoading: usersQuery.isLoading || teamsQuery.isLoading || teamMembersQuery.isLoading,
        currentUser,
        updateRole,
        removeUser,
        assignTeam,
        removeTeam,
        updateMemberRole,
    };
}
