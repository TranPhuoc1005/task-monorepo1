"use client";

import { useAdminUsers as useSharedAdminUsers } from '@taskpro/shared';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function useAdminUsers() {
  const supabase = createClient();
  const { currentUser } = useAuth();
  return useSharedAdminUsers(supabase, currentUser);
}
