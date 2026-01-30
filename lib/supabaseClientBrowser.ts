'use client'

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

/** Browser Supabase client; uses cookies so server can read session. */
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
