"use client"

import { useState } from "react"
import { ProductCard } from "./ProductCard"
import { cn } from "@/lib/utils"

// Since this uses DB rows, we'll define a minimal interface based on the schema
interface ProductRow {
  id: string
  title: string
  price: number
  imageUrl?: string // mapped from images[0]
  condition: "new" | "used"
  vehicle_make: string | null
}

interface HotPicksTabsProps {
  initialProducts: ProductRow[]
}

export function HotPicksTabs({ initialProducts }: HotPicksTabsProps) {
  // Extract unique makes for the tabs
  const makes = Array.from(new Set(initialProducts.map(p => p.vehicle_make).filter(Boolean))) as string[]
  const tabs = ["All", ...makes]

  const [activeTab, setActiveTab] = useState("All")

  const filteredProducts = activeTab === "All" 
    ? initialProducts 
    : initialProducts.filter(p => p.vehicle_make === activeTab)

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-full px-6 py-2 text-sm font-semibold transition-colors",
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-surface-alt text-muted hover:bg-primary-light hover:text-primary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              condition={product.condition}
              imageUrl={product.imageUrl || ""}
              rating={4.5} // Placeholder
              reviewsCount={12} // Placeholder
            />
          ))}
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-2xl bg-surface-alt text-muted">
          No parts found for {activeTab}.
        </div>
      )}
    </div>
  )
}
