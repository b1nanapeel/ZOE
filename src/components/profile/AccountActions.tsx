"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ExportButton() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zoe-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Export ready", description: "Check your downloads." });
    } catch (e) {
      toast({
        title: "Could not export",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" block onClick={download} disabled={busy}>
      <Download className="h-4 w-4" />
      {busy ? "Preparing…" : "Export all my data"}
    </Button>
  );
}

export function DeleteAccountButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function deleteAccount() {
    const phrase = prompt(
      'This permanently deletes your account and every clip. Type "delete" to confirm.',
    );
    if (phrase?.trim().toLowerCase() !== "delete") return;
    setBusy(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not delete account.");
      }
      toast({ title: "Account deleted" });
      router.replace("/login");
      router.refresh();
    } catch (e) {
      toast({
        title: "Could not delete",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
      setBusy(false);
    }
  }

  return (
    <Button
      variant="secondary"
      block
      onClick={deleteAccount}
      disabled={busy}
      className="border-red-200 text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
      {busy ? "Deleting…" : "Delete my account"}
    </Button>
  );
}
