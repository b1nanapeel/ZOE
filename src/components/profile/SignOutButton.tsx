"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-browser";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button
      variant="secondary"
      block
      onClick={signOut}
      disabled={signingOut}
    >
      <LogOut className="h-4 w-4" />
      {signingOut ? "Signing out…" : "Sign out"}
    </Button>
  );
}
