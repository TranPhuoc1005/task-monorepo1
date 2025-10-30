"use client";

import { useAuth as useSharedAuth } from '@taskpro/shared';
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const supabase = createClient();
  return useSharedAuth(supabase);
}
