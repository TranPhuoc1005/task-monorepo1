import { Profile } from "../types/profile";

export const getProfileApi = async (supabase: any): Promise<Profile> => {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    if (error) throw error;
    return data;
};

export const updateProfileApi = async (supabase: any, updates: Partial<Profile>): Promise<Profile> => {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single();

    if (error) throw error;
    return data;
};
