"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-ink hover:text-primary"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full w-full bg-surface border-b border-border p-6 shadow-lg flex flex-col gap-6">
          <Link href="/shop" onClick={() => setIsOpen(false)} className="text-lg font-medium text-ink hover:text-primary">Shop</Link>
          <Link href="/categories" onClick={() => setIsOpen(false)} className="text-lg font-medium text-ink hover:text-primary">Categories</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="text-lg font-medium text-ink hover:text-primary">About</Link>
          <Link href="/dashboard/products/new" onClick={() => setIsOpen(false)} className="text-lg font-medium text-ink hover:text-primary">Sell Scrap</Link>
        </div>
      )}
    </div>
  )
}
