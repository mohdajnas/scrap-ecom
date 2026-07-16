"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

export function ShopFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCondition = searchParams.get("condition") || ""
  const currentMinPrice = searchParams.get("min_price") || ""
  const currentMaxPrice = searchParams.get("max_price") || ""

  const [minPrice, setMinPrice] = useState(currentMinPrice)
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice)
  const [isPending, startTransition] = useTransition()

  const handleConditionChange = (condition: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (condition === currentCondition) {
      params.delete("condition") // Toggle off if clicked again
    } else {
      params.set("condition", condition)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set("min_price", minPrice)
    else params.delete("min_price")

    if (maxPrice) params.set("max_price", maxPrice)
    else params.delete("max_price")

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("condition")
    params.delete("min_price")
    params.delete("max_price")
    setMinPrice("")
    setMaxPrice("")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Condition Filter */}
      <div>
        <h4 className="mb-3 font-semibold text-ink">Condition</h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer hover:text-primary">
            <input
              type="checkbox"
              checked={currentCondition === "new"}
              onChange={() => handleConditionChange("new")}
              disabled={isPending}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4 accent-primary disabled:opacity-50"
            />
            Brand New
          </label>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer hover:text-primary">
            <input
              type="checkbox"
              checked={currentCondition === "used"}
              onChange={() => handleConditionChange("used")}
              disabled={isPending}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4 accent-primary disabled:opacity-50"
            />
            Used
          </label>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer hover:text-primary">
            <input
              type="checkbox"
              checked={currentCondition === "refurbished"}
              onChange={() => handleConditionChange("refurbished")}
              disabled={isPending}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4 accent-primary disabled:opacity-50"
            />
            Refurbished
          </label>
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="mb-3 font-semibold text-ink">Price Range (₹)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            disabled={isPending}
            className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
          />
        </div>
        <Button variant="outline" className="w-full mt-3 h-8 text-xs" onClick={handlePriceApply} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Range"}
        </Button>
      </div>

      {/* Clear Filters */}
      {(currentCondition || currentMinPrice || currentMaxPrice) && (
        <button
          onClick={handleClearAll}
          disabled={isPending}
          className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline disabled:opacity-50"
        >
          {isPending ? "Clearing..." : "Clear all filters"}
        </button>
      )}
    </div>
  )
}
