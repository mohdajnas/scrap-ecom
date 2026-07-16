import { createAdminClient } from "@/lib/supabase/admin"
import { PriceTag } from "@/components/shared/PriceTag"

export const revalidate = 0

export default async function AdminDashboardPage() {
  const adminClient = createAdminClient()

  // Note: For a real production app at scale, you'd want aggregate views or materialized 
  // views for these stats rather than full table counts.
  const [
    { count: pendingCount },
    { count: userCount },
    { data: orders }
  ] = await Promise.all([
    adminClient.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
    adminClient.from('orders').select('total_amount').eq('status', 'paid')
  ])

  const revenue = (orders || []).reduce((acc, order) => acc + Number(order.total_amount), 0)

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-8">Dashboard Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-2xl bg-surface p-6 shadow-soft">
          <p className="text-sm font-medium text-muted">Pending Listings</p>
          <p className="mt-2 text-3xl font-bold text-ink">{pendingCount || 0}</p>
        </div>
        
        <div className="rounded-2xl bg-surface p-6 shadow-soft">
          <p className="text-sm font-medium text-muted">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-success">
            <PriceTag amount={revenue} />
          </p>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-soft">
          <p className="text-sm font-medium text-muted">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-ink">{userCount || 0}</p>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-soft">
          <p className="text-sm font-medium text-muted">Total Paid Orders</p>
          <p className="mt-2 text-3xl font-bold text-ink">{(orders || []).length}</p>
        </div>

      </div>
    </div>
  )
}
