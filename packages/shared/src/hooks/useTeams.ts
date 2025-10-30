import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    listTeamsApi,
    listTeamMembersApi,
    assignTeamMemberApi,
    updateTeamMemberRoleApi,
    removeTeamMemberApi,
} from "../api/team.api";

export function useTeams(supabase: any, currentUser: any) {
    const queryClient = useQueryClient();

    const teamsQuery = useQuery({
        queryKey: ["teams"],
        queryFn: () => listTeamsApi(supabase),
    });

    const teamMembersQuery = useQuery({
        queryKey: ["team-members"],
        queryFn: () => listTeamMembersApi(supabase),
        enabled: !!currentUser,
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

    const updateMemberRole = useMutation({
        mutationFn: ({ membershipId, role }: { membershipId: string; role: "team_lead" | "member" }) =>
            updateTeamMemberRoleApi(supabase, membershipId, role),
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

    return {
        teamsQuery,
        teamMembersQuery,
        assignTeam,
        updateMemberRole,
        removeTeam,
    };
}
