import { createAdminClient } from "@/lib/supabase/admin"
import { AdminOrderActions } from "@/components/admin/AdminOrderActions"
import { PriceTag } from "@/components/shared/PriceTag"

export const revalidate = 0

export default async function AdminOrdersPage() {
  const adminClient = createAdminClient()

  const { data: orders } = await adminClient
    .from('orders')
    .select('*, profiles:buyer_id(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-8">Platform Orders</h1>

      <div className="rounded-2xl bg-surface shadow-soft overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-alt text-muted">
            <tr>
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Buyer</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(orders || []).map((order) => {
              const buyer = order.profiles as any
              return (
                <tr key={order.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-ink text-xs">{order.id}</td>
                  <td className="px-6 py-4 font-medium text-ink">{buyer?.full_name}</td>
                  <td className="px-6 py-4 font-semibold text-ink"><PriceTag amount={order.total_amount} /></td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold uppercase ${
                      order.status === 'paid' ? 'bg-success/10 text-success' :
                      order.status === 'refunded' ? 'bg-muted text-ink' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <AdminOrderActions orderId={order.id} status={order.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
