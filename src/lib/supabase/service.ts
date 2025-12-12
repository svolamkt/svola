import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client con service role key
 * Usato per operazioni che devono bypassare RLS (es. webhook)
 * 
 * ⚠️ IMPORTANTE: Non esporre mai questa key nel frontend!
 * Usa solo in Server Actions o API Routes.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}


