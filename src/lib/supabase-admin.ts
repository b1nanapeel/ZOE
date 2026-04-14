import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./supabase";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function isAdminConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

// Server-side admin client. Bypasses RLS — use only after explicit auth checks.
export function createAdminClient() {
  if (!isAdminConfigured()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local.",
    );
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
