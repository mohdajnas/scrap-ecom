import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ProductListClient } from "./ProductListClient"

export const revalidate = 0

export default async function MyProductsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard/products")
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", user.id)
    .or("rejection_reason.is.null,rejection_reason.neq.deleted_by_seller")
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-ink">My Listed Scrap</h1>
        <Link 
          href="/dashboard/products/new" 
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-5 w-5" />
          Add New Product
        </Link>
      </div>

      <ProductListClient products={products || []} />
    </div>
  )
}
