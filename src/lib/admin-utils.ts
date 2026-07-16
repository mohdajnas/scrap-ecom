import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function verifySuperAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { isAuthorized: false, user: null }
  }

  // Re-verify the role server-side directly from the DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return { isAuthorized: false, user: null }
  }

  return { isAuthorized: true, user }
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetTable: string,
  targetId: string
) {
  const adminClient = createAdminClient()
  await adminClient.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    target_table: targetTable,
    target_id: targetId,
  })
}
