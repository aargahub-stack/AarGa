import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses the SERVICE ROLE key, which bypasses Row Level Security — this file
 * must never be imported from a "use client" component or exposed to the
 * browser bundle. It is safe here because every consumer in src/lib/api/*
 * only runs inside Server Components or Route Handlers.
 *
 * If the env vars are not set (e.g. local dev before Supabase is wired up),
 * `supabaseServer` is `null` and every service-layer function in
 * `src/lib/api/*` transparently falls back to the static seed data in
 * `src/data/*` so the site still renders end to end.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client = null;

if (supabaseUrl && serviceRoleKey) {
  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
} else if (process.env.NODE_ENV !== "production") {
  // Loud in dev, silent-ish in prod build logs.
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — " +
      "src/lib/api/* will serve static fallback data from src/data/*."
  );
}

export const supabaseServer = client;
export const isSupabaseConfigured = Boolean(client);
