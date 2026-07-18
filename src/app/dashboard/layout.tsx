import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

import { DashboardNav } from "@/components/dashboard/DashboardNav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Dashboard Sub-navigation */}
      <DashboardNav />

      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
