import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SellScrapForm } from "@/components/dashboard/SellScrapForm"

export const revalidate = 0

export default async function SellScrapPage() {
  const supabase = createClient()
  
  // Enforce auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login?next=/dashboard/products/new")
  }

  // Fetch categories for the form
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  const categories = categoriesData || []

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Sell Scrap / Parts
        </h1>
        <p className="mt-2 text-muted">
          List your high-quality second-hand vehicle parts on our marketplace.
        </p>
      </div>

      <SellScrapForm categories={categories} />
    </div>
  )
}
