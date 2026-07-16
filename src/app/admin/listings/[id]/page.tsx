import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import Image from "next/image"
import { PriceTag } from "@/components/shared/PriceTag"
import { Badge } from "@/components/ui/Badge"
import { AdminListingsActions } from "@/components/admin/AdminListingsActions"
import Link from "next/link"

export const revalidate = 0

export default async function AdminListingReviewPage({ params }: { params: { id: string } }) {
  const adminClient = createAdminClient()

  const { data: product } = await adminClient
    .from("products")
    .select("*, profiles:seller_id(full_name, city)")
    .eq("id", params.id)
    .single()

  if (!product) notFound()

  const seller = product.profiles as any

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/listings" className="text-primary hover:underline text-sm font-medium">
          &larr; Back to Listings
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-ink mb-8">Review Listing</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-alt shadow-soft">
            {product.images?.[0] ? (
              <Image src={product.images[0]} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted">No Image</div>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-2xl bg-surface p-6 shadow-soft">
            <h2 className="text-2xl font-bold text-ink">{product.title}</h2>
            <div className="mt-2 text-2xl font-bold text-primary">
              <PriceTag amount={product.price} />
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted">Status</span>
                <span className="font-semibold uppercase text-warning">{product.status}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted">Condition</span>
                <Badge status={product.condition as any} />
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted">Seller</span>
                <span className="font-medium text-ink">{seller?.full_name} ({seller?.city})</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-ink">Description</h3>
              <p className="mt-2 text-sm text-muted whitespace-pre-wrap">{product.description}</p>
            </div>

            <AdminListingsActions productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
