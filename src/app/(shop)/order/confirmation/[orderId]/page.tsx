import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { CheckCircle2, Package } from "lucide-react"

export const revalidate = 0

export default async function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return notFound()

  // Ensure this user actually owns the order (RLS will also protect this)
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(title, images))")
    .eq("id", params.orderId)
    .single()

  if (!order || order.buyer_id !== user.id) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      
      <h1 className="mt-8 text-4xl font-bold text-ink">Payment Successful!</h1>
      <p className="mt-4 text-lg text-muted">
        Thank you for your purchase. Your order #{order.id.slice(0, 8)} has been confirmed.
      </p>

      <div className="mt-12 rounded-3xl bg-surface p-8 shadow-soft text-left">
        <h3 className="text-xl font-bold text-ink mb-6">Order Details</h3>
        <div className="space-y-4 divide-y divide-border">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-alt text-primary">
                <Package className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink">{item.products?.title || 'Unknown Product'}</p>
                <p className="text-sm text-muted">Qty: {item.quantity}</p>
              </div>
              <div className="font-bold text-ink">₹{item.price_at_time}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between border-t border-border pt-6 text-lg font-bold text-ink">
          <span>Total Paid</span>
          <span className="text-primary">₹{order.total_amount}</span>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link href="/dashboard/orders">
          <Button variant="primary" size="lg">View My Orders</Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline" size="lg" className="bg-white">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
