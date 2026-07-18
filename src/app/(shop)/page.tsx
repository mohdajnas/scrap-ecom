import { Hero } from "@/components/layout/Hero"
import { CategoryCard } from "@/components/shared/CategoryCard"
import { HotPicksTabs } from "@/components/shared/HotPicksTabs"
import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { Button } from "@/components/ui/Button"

export const revalidate = 0 // Disable caching for now to see live DB updates

export default async function HomePage() {
  const supabase = createClient()

  // Fetch live categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .limit(6)

  const categories = categoriesData || []

  // Fetch approved products for Hot Picks
  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .eq("status", "approved")
    .gt("stock_qty", 0)
    .order("created_at", { ascending: false })
    .limit(12)

  const products = (productsData || []).map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    imageUrl: p.images?.[0] || "",
    condition: p.condition,
    vehicle_make: p.vehicle_make,
    stock_qty: p.stock_qty
  }))

  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />

      {/* Featured Categories */}
      <section className="mx-auto w-full max-w-7xl px-6">
        <h2 className="mb-8 text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Featured categories
        </h2>
        
        {categories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="flex h-48 items-center justify-center rounded-2xl bg-surface-alt text-muted">
            No categories available. Please seed the database.
          </div>
        )}
      </section>

      {/* Hot Picks */}
      <section className="mx-auto w-full max-w-7xl px-6">
        <h2 className="mb-8 text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Hot picks for you
        </h2>
        <HotPicksTabs initialProducts={products} />
      </section>

      {/* Bottom Promo Banner */}
      <section className="mx-auto w-full max-w-7xl px-6">
        <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-primary-dark to-primary px-8 py-12 md:flex-row md:px-16 md:py-16">
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <div className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-md">
              Limited Time Only
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Get 20% off on premium brake kits
            </h2>
            <p className="mt-4 text-lg text-primary-light">
              Upgrade your stopping power with certified, top-rated brake pads and rotors.
            </p>
            <div className="mt-8">
              <Button variant="outline" className="border-transparent bg-white text-primary hover:bg-surface-alt">
                Shop the Sale
              </Button>
            </div>
          </div>
          
          <div className="relative mt-8 h-48 w-full overflow-hidden rounded-xl md:mt-0 md:h-64 md:w-1/2 lg:w-1/3">
            <Image
              src="/promo/brake-kits.png"
              alt="Premium Brake Kits Promo"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
