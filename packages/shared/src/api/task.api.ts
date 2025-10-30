import { Task } from "../types/task";

export const listTasksApi = async (supabase: any): Promise<Task[]> => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    let query = supabase
        .from("tasks")
        .select(
            `
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        department
      )
    `
        )
        .order("created_at", { ascending: false });

    if (profile?.role === "employee") {
        query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
};

export const createTaskApi = async (supabase: any, taskData: Partial<Task>): Promise<Task> => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...taskData, created_by: user.id }])
        .select(
            `
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        department
      )
    `
        )
        .single();

    if (error) throw error;
    return data;
};

export const updateTaskApi = async (supabase: any, id: number, updates: Partial<Task>): Promise<Task> => {
    const { data, error } = await supabase
        .from("tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(
            `
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        department
      )
    `
        )
        .single();

    if (error) throw error;
    return data;
};

export const moveTaskApi = async (supabase: any, id: number, status: Task["status"]): Promise<Task> => {
    const { data, error } = await supabase
        .from("tasks")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(
            `
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        department
      )
    `
        )
        .single();

    if (error) throw error;
    return data;
};

export const deleteTaskApi = async (supabase: any, id: number): Promise<void> => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
};
