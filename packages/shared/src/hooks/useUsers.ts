import { useQuery } from "@tanstack/react-query";
import { listUsersApi } from "../api/user.api";
import type { User } from "../types/user";
import { createClient } from "../lib/supabase/client.web";

export function useUsers() {
    const supabase = createClient();

    return useQuery<User[], Error>({
        queryKey: ["users"],
        queryFn: () => listUsersApi(supabase),
        staleTime: 5 * 60 * 1000, // cache 5 phút
    });
}
