import Link from "next/link"
import { NavbarActions } from "./NavbarActions"
import { MobileMenu } from "./MobileMenu"

export function Navbar() {

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-surface/70 py-4 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <span className="text-xl font-black italic">P</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-ink">Patshell</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/shop" className="text-sm font-semibold text-ink/80 transition-colors hover:text-primary">Shop</Link>
          <Link href="/categories" className="text-sm font-semibold text-ink/80 transition-colors hover:text-primary">Categories</Link>
          <Link href="/dashboard/products/new" className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark">Sell Scrap</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <MobileMenu />
          <NavbarActions />
        </div>
      </div>
    </nav>
  )
}

