"use client";

import { useTeams as useSharedTeams } from '@taskpro/shared';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function useTeams() {
  const supabase = createClient();
  const { currentUser } = useAuth();
  const shared = useSharedTeams(supabase, currentUser);
  return {
    ...shared,
    currentUser,
  };
}
