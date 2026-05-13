import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cached: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  )
}

function getEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Single server-only Supabase client. Lazily created on first use so importing
 * this module never throws during `next build` when env vars are absent (e.g.
 * CI); API helpers should call `isSupabaseConfigured()` and short-circuit first.
 */
export function getSupabase(): SupabaseClient {
  if (cached) return cached
  cached = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
  return cached
}

/**
 * Ergonomic alias — proxies to `getSupabase()` on first property access so
 * `import { supabase }` does not read env at module load time.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabase()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client)
    }
    return value
  },
})
