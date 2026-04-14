"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-browser";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Add credentials to .env.local.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Add credentials to .env.local.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep documenting what matters."
      footer={
        <>
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary-600 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" block disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-neutral-400">
        <div className="h-px flex-1 bg-neutral-200" />
        or
        <div className="h-px flex-1 bg-neutral-200" />
      </div>
      <Button variant="secondary" block onClick={signInWithGoogle} type="button">
        Continue with Google
      </Button>
    </AuthShell>
  );
}
