"use client";

import { useNotifications as useSharedNotifications } from '@taskpro/shared';
import { createClient } from "@/lib/supabase/client";

export function useNotifications() {
  const supabase = createClient();
  return useSharedNotifications(supabase);
}
