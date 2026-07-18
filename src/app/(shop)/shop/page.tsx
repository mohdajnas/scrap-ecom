import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/shared/ProductCard"
import { ShopFilters } from "@/components/shop/ShopFilters"
import { ShopSortDropdown } from "@/components/shop/ShopSortDropdown"
import Link from "next/link"

export const revalidate = 0

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  
  const q = typeof searchParams.q === 'string' ? searchParams.q : null
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest'
  const condition = typeof searchParams.condition === 'string' ? searchParams.condition : null
  const minPrice = typeof searchParams.min_price === 'string' ? searchParams.min_price : null
  const maxPrice = typeof searchParams.max_price === 'string' ? searchParams.max_price : null
  
  let query = supabase.from("products").select("*, categories(name, slug)")
    .eq("status", "approved")
    .gt("stock_qty", 0)

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }

  if (condition) {
    query = query.eq("condition", condition)
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    query = query.gte("price", Number(minPrice))
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    query = query.lte("price", Number(maxPrice))
  }

  if (sort === "price-asc") {
    query = query.order("price", { ascending: true })
  } else if (sort === "price-desc") {
    query = query.order("price", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data: productsData, error } = await query

  const products = productsData || []

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-ink">All Parts</h1>
          <p className="text-muted">
            {q ? `Search results for "${q}"` : "Browse our premium selection of certified parts"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ShopSortDropdown />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="rounded-2xl bg-surface p-6 shadow-soft">
            <h3 className="font-bold text-ink mb-6">Filters</h3>
            <ShopFilters />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    condition={product.condition}
                    imageUrl={product.images?.[0] || ""}
                    rating={4.5}
                    stockQty={product.stock_qty}
                  />
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl bg-surface-alt">
              <p className="text-muted">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
