"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

export function ShopSortDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSort = searchParams.get("sort") || "newest"

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", e.target.value)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-muted">Sort by:</label>
      <div className="relative">
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleSortChange}
          disabled={isPending}
          className="h-9 rounded-lg border border-border bg-surface px-3 pr-8 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        {isPending && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
