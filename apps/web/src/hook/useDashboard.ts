"use client";

import { useDashboard as useSharedDashboard } from '@taskpro/shared';
import { createClient } from "@/lib/supabase/client";

export function useDashboard() {
  const supabase = createClient();
  return useSharedDashboard(supabase);
}
