import Link from "next/link"
import { NavbarActions } from "./NavbarActions"
import { MobileMenu } from "./MobileMenu"

export function Navbar() {

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface/80 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-primary">Patshell Trading</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/shop" className="text-sm font-medium text-ink transition-colors hover:text-primary">Shop</Link>
          <Link href="/categories" className="text-sm font-medium text-ink transition-colors hover:text-primary">Categories</Link>
          <Link href="/about" className="text-sm font-medium text-ink transition-colors hover:text-primary">About</Link>
          <Link href="/dashboard/products/new" className="text-sm font-medium text-ink transition-colors hover:text-primary">Sell Scrap</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <MobileMenu />
          <NavbarActions />
        </div>
      </div>
    </nav>
  )
}

