import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Gets the signed-in user's auth record + profile (role). Redirects to
 * /login if not signed in. Use at the top of any protected page/layout.
 */
export async function requireUser(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Profile row should be created automatically by the DB trigger on
    // signup. If it's missing, something's off with setup — send them
    // to a clear error rather than a silent crash.
    redirect("/login?error=no_profile");
  }

  return { userId: user.id, email: user.email ?? null, profile };
}

/** Redirects store_staff away from owner-only pages. */
export async function requireOwner() {
  const ctx = await requireUser();
  if (ctx.profile.role !== "owner") {
    redirect("/dashboard?error=owner_only");
  }
  return ctx;
}
