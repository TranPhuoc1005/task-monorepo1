import { createClient } from "@/lib/supabase/client";
import { Task } from "@/types";

export const listTasksApi = async (): Promise<Task[]> => {
    const supabase = createClient();

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

    return data || [];
};

export const getTaskByIdApi = async (id: number): Promise<Task> => {
    const supabase = createClient();

    const { data, error } = await supabase
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
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
};

export const createTaskApi = async (taskData: Partial<Task>): Promise<Task> => {
    const supabase = createClient();

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

export const updateTaskApi = async ({ id, updates }: { id: number; updates: Partial<Task> }): Promise<Task> => {
    const supabase = createClient();

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

export const moveTaskApi = async ({ id, status }: { id: number; status: Task["status"] }): Promise<Task> => {
    const supabase = createClient();

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

export const deleteTaskApi = async (id: number): Promise<void> => {
    const supabase = createClient();

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
};

export const updateDueDateApi = async (id: number, due_date: string): Promise<Task> => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("tasks")
        .update({ due_date })
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        console.error("updateDueDateApi ~ error:", error);
        throw new Error(error.message);
    }

    return data;
};