import { useAdminUsers as useSharedAdminUsers } from "@taskpro/shared/hooks/useAdminUsers";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export function useAdminUsers() {
    const { currentUser } = useAuth();
    const sharedHook = useSharedAdminUsers(supabase, currentUser);

    return {
        ...sharedHook,
        currentUser,
    };
}
