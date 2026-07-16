import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * WARNING: This is the Supabase admin client containing the SERVICE_ROLE_KEY.
 * It bypasses Row Level Security (RLS) entirely!
 * 
 * NEVER import this into any client component or exposed route without 
 * doing your own manual authentication and role authorization checks first.
 * Use it ONLY inside /app/api routes or secure server actions where needed.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  )
}
