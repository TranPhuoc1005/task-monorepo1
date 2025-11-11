import { useAuth as useSharedAuth } from "@taskpro/shared/hooks/useAuth";
import { supabase } from "../lib/supabase";
export function useAuth() {
    return useSharedAuth(supabase);
}