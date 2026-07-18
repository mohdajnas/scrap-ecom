import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { PriceTag } from "@/components/shared/PriceTag"
import { Badge } from "@/components/ui/Badge"
import { MapPin, ShieldCheck, User } from "lucide-react"
import { AddToCartButton } from "@/components/shared/AddToCartButton"
import { Button } from "@/components/ui/Button"
import { Star } from "lucide-react"
import { Metadata } from 'next'

export const revalidate = 0

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: product } = await supabase.from('products').select('title, description').eq('id', params.id).single()
  
  if (!product) return {}
  
  return {
    title: `${product.title} | Patshell Trading`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.substring(0, 160),
    }
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      profiles:seller_id(full_name, city)
    `)
    .eq("id", params.id)
    .single()

  if (!product) {
    notFound()
  }

  const seller = product.profiles as any

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-12 md:grid-cols-2">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-surface-alt shadow-soft">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted">No Image</div>
            )}
            <div className="absolute left-4 top-4">
              <Badge status={product.condition as any} />
            </div>
          </div>
          {/* Thumbnails placeholder */}
          <div className="flex gap-4">
            {(product.images || []).slice(1, 4).map((img: string, i: number) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl bg-surface-alt">
                <Image src={img} alt="" fill sizes="(max-width: 768px) 25vw, 15vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-ink md:text-5xl">{product.title}</h1>
          
          <div className="mt-4 flex items-center gap-2">
            <div className="flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(product.avg_rating) ? 'fill-current' : 'text-border'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-ink">{product.avg_rating}</span>
            <span className="text-sm text-muted">({product.review_count} reviews)</span>
          </div>
          
          <div className="mt-4 text-3xl text-primary">
            <PriceTag amount={product.price} />
          </div>

          <div className="mt-8 rounded-2xl bg-surface-alt p-6">
            <h3 className="font-semibold text-ink">Seller Information</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-ink">{seller?.full_name}</p>
                <p className="flex items-center gap-1 text-sm text-muted">
                  <MapPin className="h-4 w-4" /> {seller?.city || "Location undisclosed"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-ink">Description</h3>
            <p className="mt-2 text-muted whitespace-pre-wrap">{product.description}</p>
          </div>
          
          <div className="mt-8">
            <h3 className="font-semibold text-ink">Fitment</h3>
            <p className="mt-2 text-sm text-muted">
              Make: <span className="font-medium text-ink">{product.vehicle_make || "Any"}</span><br/>
              Model: <span className="font-medium text-ink">{product.vehicle_model || "Any"}</span>
            </p>
          </div>

          <div className="mt-auto pt-10">
            {product.stock_qty <= 0 ? (
              <div className="w-full">
                <Button variant="secondary" size="lg" className="w-full opacity-50" disabled>
                  Out of Stock
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-1">
                  <AddToCartButton productId={product.id} />
                </div>
                <div className="flex-1">
                  <Button variant="outline" size="lg" className="w-full bg-white">Buy Now</Button>
                </div>
              </div>
            )}
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
              <ShieldCheck className="h-4 w-4 text-success" />
              Patshell Buyer Protection Guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
