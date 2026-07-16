import { createClient } from "@/lib/supabase/server"
import { CategoryCard } from "@/components/shared/CategoryCard"
import Link from "next/link"

export const metadata = {
  title: "All Categories | Patshell Trading",
  description: "Browse all vehicle spare parts categories on Patshell Trading.",
}

export const revalidate = 3600 // Cache for 1 hour

export default async function CategoriesPage() {
  const supabase = createClient()
  
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })

  const categories = categoriesData || []

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
          All Categories
        </h1>
        <p className="mt-2 text-muted">Browse spare parts by category</p>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.name}
              description={category.description}
              imageUrl={category.image_url || ""}
              href={`/shop/${category.slug}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-3xl bg-surface-alt">
          <p className="text-muted">No categories found.</p>
        </div>
      )}
    </div>
  )
}
