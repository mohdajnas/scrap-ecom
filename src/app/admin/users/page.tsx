import { createAdminClient } from "@/lib/supabase/admin"
import { AdminUserActions } from "@/components/admin/AdminUserActions"

export const revalidate = 0

export default async function AdminUsersPage() {
  const adminClient = createAdminClient()

  const { data: users } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-8">User Management</h1>

      <div className="rounded-2xl bg-surface shadow-soft overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-alt text-muted">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(users || []).map((user) => (
              <tr key={user.id} className="hover:bg-surface-alt/50 transition-colors">
                <td className="px-6 py-4 font-medium text-ink">{user.full_name}</td>
                <td className="px-6 py-4"><span className="uppercase text-xs font-bold text-primary">{user.role}</span></td>
                <td className="px-6 py-4">
                  {user.is_banned ? (
                    <span className="text-danger font-semibold">Banned</span>
                  ) : (
                    <span className="text-success font-semibold">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 text-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  {user.role !== 'super_admin' && (
                    <AdminUserActions userId={user.id} isBanned={user.is_banned} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
