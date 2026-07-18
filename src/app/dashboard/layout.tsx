import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Dashboard Sub-navigation */}
      <div className="border-b bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-6 py-3 text-sm font-medium">
          <Link href="/dashboard/profile" className="text-muted hover:text-primary whitespace-nowrap">Profile</Link>
          <Link href="/dashboard/orders" className="text-muted hover:text-primary whitespace-nowrap">My Purchases</Link>
          <Link href="/dashboard/sales" className="text-muted hover:text-primary whitespace-nowrap">My Sales</Link>
          <Link href="/dashboard/products" className="text-muted hover:text-primary whitespace-nowrap">My Listed Scrap</Link>
        </div>
      </div>

      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
