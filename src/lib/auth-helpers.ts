import { createServerSupabase } from "./supabase-server";

export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function userDisplayName(
  user: { email?: string | null; user_metadata?: Record<string, unknown> } | null,
) {
  if (!user) return "Someone";
  const meta = (user.user_metadata ?? {}) as { name?: string };
  return meta.name?.trim() || user.email?.split("@")[0] || "Someone";
}
