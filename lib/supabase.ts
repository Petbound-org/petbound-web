import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

let cached: SupabaseClient | null = null

/**
 * Single server-only Supabase client used by every read in the app.
 * Uses the service role key — never expose this to the browser.
 */
export function getSupabase(): SupabaseClient {
  if (cached) return cached
  cached = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
  return cached
}

export const supabase = getSupabase()
