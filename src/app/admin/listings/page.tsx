import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { PriceTag } from "@/components/shared/PriceTag"
import { Badge } from "@/components/ui/Badge"

export const revalidate = 0

export default async function AdminListingsPage() {
  const adminClient = createAdminClient()

  // Fetch pending products
  const { data: products } = await adminClient
    .from('products')
    .select('*, profiles:seller_id(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-8">Pending Listings</h1>

      {(!products || products.length === 0) ? (
        <div className="rounded-2xl bg-surface p-12 text-center shadow-soft">
          <p className="text-muted">No pending listings to review.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface shadow-soft overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt text-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Product Title</th>
                <th className="px-6 py-4 font-medium">Seller</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Condition</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const seller = product.profiles as any
                return (
                  <tr key={product.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink">{product.title}</td>
                    <td className="px-6 py-4 text-muted">{seller?.full_name}</td>
                    <td className="px-6 py-4 font-semibold text-ink"><PriceTag amount={product.price} /></td>
                    <td className="px-6 py-4"><Badge status={product.condition as any} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/listings/${product.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
