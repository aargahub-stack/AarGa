import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses elevated secret authorization (SUPABASE_SECRET_KEY exclusively), which bypasses
 * Row Level Security. This module must never be imported from a Client Component or
 * exposed to browser bundles.
 *
 * Client instantiation is deferred to request runtime inside active Cloudflare
 * request contexts and memoized per isolate lifecycle.
 */

let cachedClient = null;

export function getSupabaseServerClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    return null;
  }

  cachedClient = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}

/**
 * Dynamic configuration check evaluated at runtime.
 */
export function isSupabaseConfigured() {
  return Boolean(getSupabaseServerClient());
}

/**
 * Transparent proxy preserving backward compatibility for existing consumers
 * while guaranteeing lazy runtime initialization and fail-safe error handling.
 */
export const supabaseServer = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabaseServerClient();
      if (!client) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[supabaseServer] Database client accessed (${String(prop)}) before SUPABASE_SECRET_KEY was configured.`
          );
        }
        throw new Error(
          `[supabaseServer] Cannot access '${String(prop)}' because SUPABASE_SECRET_KEY is not configured.`
        );
      }

      const val = client[prop];
      return typeof val === "function" ? val.bind(client) : val;
    },
  }
);
