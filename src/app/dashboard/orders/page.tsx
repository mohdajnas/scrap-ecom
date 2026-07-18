import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PriceTag } from "@/components/shared/PriceTag"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

export const revalidate = 0

export default async function DashboardOrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard/orders")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, products(title))")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success'
      case 'created': return 'bg-warning/10 text-warning'
      case 'cancelled': return 'bg-danger/10 text-danger'
      default: return 'bg-primary/10 text-primary'
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-ink mb-8">My Orders</h1>

      {(!orders || orders.length === 0) ? (
        <div className="rounded-3xl bg-surface-alt py-20 text-center">
          <p className="text-muted">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="mt-4 inline-block font-semibold text-primary hover:underline">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-surface p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <p className="text-sm text-muted">Order ID: <span className="font-mono text-ink">{order.id}</span></p>
                  {order.tracking_id && (
                    <p className="text-sm text-muted">Tracking ID: <span className="font-mono font-bold text-primary">{order.tracking_id}</span></p>
                  )}
                  <p className="text-sm text-muted">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-xs font-semibold text-muted">Payment: {order.razorpay_order_id?.startsWith('COD') ? 'Cash on Delivery' : 'Online'}</span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-semibold text-ink">{item.products?.title || 'Unknown Product'}</p>
                      <div className="flex gap-4 mt-1 items-center">
                        <p className="text-sm text-muted">Qty: {item.quantity}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(item.status || order.status)}`}>
                          {item.status || order.status}
                        </span>
                      </div>
                    </div>
                    <div className="font-semibold text-ink">
                      <PriceTag amount={item.price_at_time} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end border-t border-border pt-4">
                <div className="text-right">
                  <p className="text-sm text-muted">Total Amount</p>
                  <p className="text-xl font-bold text-primary">
                    <PriceTag amount={order.total_amount} />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
