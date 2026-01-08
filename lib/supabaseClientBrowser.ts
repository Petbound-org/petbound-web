'use client'

import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client for authentication
// Uses NEXT_PUBLIC_ prefixed environment variables
export const createBrowserClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )
}
