"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

export async function signIn(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/problems");
}

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------

export async function signUp(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  // Derive the origin from the incoming request so the confirmation-email
  // redirect link points to the correct domain in all environments
  // (web.nograder.dev in production, localhost:3000 locally).
  const reqHeaders = await headers();
  const origin = reqHeaders.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  redirect("/problems");
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
