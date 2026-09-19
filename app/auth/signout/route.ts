import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Status 303 forces the browser to switch to GET for the redirect target.
  // The default (307) preserves the original POST method, which breaks here
  // since /login only accepts GET — see README/commit note for details.
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
