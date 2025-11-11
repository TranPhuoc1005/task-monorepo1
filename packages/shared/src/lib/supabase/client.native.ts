import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto"; // bắt buộc cho RN

export function createClient() {
  return createSupabaseClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
  );
}
