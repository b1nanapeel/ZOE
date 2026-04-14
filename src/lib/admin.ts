import type { User } from "@supabase/supabase-js";

export const ADMIN_EMAIL = "shakil.musthafa01@gmail.com";

export function isAdmin(user: User | null | undefined) {
  return user?.email?.toLowerCase() === ADMIN_EMAIL;
}
