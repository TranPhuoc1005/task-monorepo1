"use client";

import { useAuth as useSharedAuth } from '@taskpro/shared';

export function useAuth() {
  return useSharedAuth();
}
