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
  name: z.string().min(1, "Tell us your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    setInfo(null);
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Add credentials to .env.local.");
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { name: values.name } },
    });
    if (error) {
      setError(error.message);
      return;
    }
    if (!data.session) {
      setInfo("Check your inbox to confirm your email, then sign in.");
      return;
    }
    router.replace("/onboarding");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start building your child's behavioral story."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
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
            autoComplete="new-password"
            {...register("password")}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-primary-700">{info}</p>}
        <Button type="submit" block disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-xs text-neutral-500 text-center">
          By continuing, you agree to our privacy policy and terms.
        </p>
      </form>
    </AuthShell>
  );
}
