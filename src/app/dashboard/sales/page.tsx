import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PriceTag } from "@/components/shared/PriceTag"
import Link from "next/link"
import { SellerOrderStatusForm } from "./SellerOrderStatusForm"

import { DownloadCsvButton } from "./DownloadCsvButton"

export const revalidate = 0

export default async function DashboardSalesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard/sales")
  }

  // We must use admin client to bypass RLS because the default RLS policy only allows buyers to see their order_items.
  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all order items where the product belongs to the current user (seller)
  // We can filter using eq('seller_id', user.id) because the table has seller_id!
  const { data: sales, error } = await adminClient
    .from("order_items")
    .select(`
      *,
      orders (
        id, created_at, tracking_id, shipping_address
      ),
      products (
        id, title, seller_id
      )
    `)
    .eq("seller_id", user.id)

  if (error) {
    console.error("Failed to load sales", error)
  }

  const mySales = (sales || []).sort((a: any, b: any) => {
    const dateA = new Date(a.orders?.created_at || 0).getTime()
    const dateB = new Date(b.orders?.created_at || 0).getTime()
    return dateB - dateA
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success/10 text-success'
      case 'shipped': return 'bg-info/10 text-info'
      case 'cancelled': return 'bg-danger/10 text-danger'
      default: return 'bg-primary/10 text-primary'
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-ink">My Sales</h1>
        {mySales.length > 0 && <DownloadCsvButton sales={mySales} />}
      </div>

      {mySales.length === 0 ? (
        <div className="rounded-3xl bg-surface-alt py-20 text-center">
          <p className="text-muted">You haven&apos;t received any orders yet.</p>
          <Link href="/dashboard/products/new" className="mt-4 inline-block font-semibold text-primary hover:underline">
            List a new product
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {mySales.map((item: any) => {
            const order = item.orders
            const product = item.products
            const address = order.shipping_address || {}

            return (
              <div key={item.id} className="rounded-2xl bg-surface p-6 shadow-soft border border-border">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <p className="font-semibold text-ink text-lg">{product.title}</p>
                    <p className="text-sm text-muted">Order ID: <span className="font-mono text-ink">{order.id}</span></p>
                    {order.tracking_id && (
                      <p className="text-sm text-muted">Tracking ID: <span className="font-mono font-bold text-primary">{order.tracking_id}</span></p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    <div className="font-semibold text-ink mt-1">
                      <PriceTag amount={item.price_at_time} /> x {item.quantity}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-ink mb-2">Shipping Details</h4>
                    <div className="text-sm text-muted space-y-1">
                      <p><span className="font-medium text-ink">{address.full_name || 'N/A'}</span></p>
                      <p>{address.phone_number}</p>
                      <p>{address.apartment ? `${address.apartment}, ` : ''}{address.street}</p>
                      {address.landmark && <p>Landmark: {address.landmark}</p>}
                      <p>{address.city}, {address.state} {address.postal_code}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-ink mb-2">Update Status</h4>
                    <div className="bg-surface-alt p-4 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm text-muted">Current Status:</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status || 'placed'}
                        </span>
                      </div>
                      
                      <SellerOrderStatusForm itemId={item.id} currentStatus={order.status || 'placed'} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
