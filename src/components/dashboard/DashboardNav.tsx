"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { name: "Profile", href: "/dashboard/profile" },
  { name: "My Purchases", href: "/dashboard/orders" },
  { name: "My Sales", href: "/dashboard/sales" },
  { name: "My Listed Scrap", href: "/dashboard/products" },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-border/40 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-8 overflow-x-auto px-6 py-0 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-ink/70 hover:border-border hover:text-ink"
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
