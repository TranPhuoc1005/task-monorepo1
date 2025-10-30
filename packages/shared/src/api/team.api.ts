import { Team, TeamMember } from "../types/team";

export const listTeamsApi = async (supabase: any): Promise<Team[]> => {
    const { data, error } = await supabase.from("teams").select("id, name, color").order("name");

    if (error) throw error;
    return data;
};

export const listTeamMembersApi = async (supabase: any): Promise<TeamMember[]> => {
    const { data: memberships, error } = await supabase
        .from("team_members")
        .select("*")
        .order("team_id", { ascending: true });

    if (error) throw error;

    if (!memberships || memberships.length === 0) return [];

    const userIds = memberships.map((m: any) => m.user_id);

    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, department")
        .in("id", userIds);

    return memberships.map((membership: any) => ({
        ...membership,
        profile: profiles?.find((p: any) => p.id === membership.user_id) || null,
    }));
};

export const assignTeamMemberApi = async (
    supabase: any,
    userId: string,
    teamId: string,
    role: "team_lead" | "member"
): Promise<TeamMember> => {
    const { data, error } = await supabase
        .from("team_members")
        .insert({ user_id: userId, team_id: teamId, role })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateTeamMemberRoleApi = async (
    supabase: any,
    membershipId: string,
    role: "team_lead" | "member"
): Promise<TeamMember> => {
    const { data, error } = await supabase
        .from("team_members")
        .update({ role })
        .eq("id", membershipId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const removeTeamMemberApi = async (supabase: any, membershipId: string): Promise<void> => {
    const { error } = await supabase.from("team_members").delete().eq("id", membershipId);

    if (error) throw error;
};
