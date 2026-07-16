import Link from "next/link"
import { Package, Users, ShoppingCart, LayoutDashboard, Tag, LogOut } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-alt">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-surface border-r border-border p-6 shadow-sm">
        <div className="mb-10">
          <Link href="/admin">
            <h1 className="text-2xl font-bold text-primary">Patshell Admin</h1>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 rounded-lg px-4 py-3 text-ink hover:bg-surface-alt hover:text-primary transition-colors">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/admin/listings" className="flex items-center gap-3 rounded-lg px-4 py-3 text-ink hover:bg-surface-alt hover:text-primary transition-colors">
            <Package className="h-5 w-5" /> Listings
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 rounded-lg px-4 py-3 text-ink hover:bg-surface-alt hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" /> Orders
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-4 py-3 text-ink hover:bg-surface-alt hover:text-primary transition-colors">
            <Users className="h-5 w-5" /> Users
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 rounded-lg px-4 py-3 text-ink hover:bg-surface-alt hover:text-primary transition-colors">
            <Tag className="h-5 w-5" /> Categories
          </Link>
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted hover:bg-danger/10 hover:text-danger transition-colors">
            <LogOut className="h-5 w-5" /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-10">
        {children}
      </main>
    </div>
  )
}
