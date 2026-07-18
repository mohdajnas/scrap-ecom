import Image from "next/image"
import { Badge } from "@/components/ui/Badge"
import { RatingStars } from "./RatingStars"
import { PriceTag } from "./PriceTag"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

interface ProductCardProps {
  id: string
  title: string
  price: number
  imageUrl: string
  condition: "new" | "used"
  rating?: number
  reviewsCount?: number
  stockQty?: number
}

export function ProductCard({ id, title, price, imageUrl, condition, rating = 0, reviewsCount = 0, stockQty = 1 }: ProductCardProps) {
  const isOutOfStock = stockQty <= 0;

  return (
    <Link href={`/product/${id}`} className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-surface-alt">
        {/* Placeholder if imageUrl is missing */}
        {imageUrl ? (
           <Image
             src={imageUrl}
             alt={title}
             fill
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
             className="object-cover transition-transform duration-300 group-hover:scale-105"
           />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">No Image</div>
        )}
        <div className="absolute left-3 top-3">
          <Badge status={condition} />
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded bg-danger px-3 py-1 text-sm font-bold tracking-wider text-white uppercase">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink line-clamp-2">{title}</h3>
          <div className="shrink-0">
            <PriceTag amount={price} />
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <RatingStars rating={rating} count={reviewsCount} />
        </div>
        
        <div className="mt-4 mt-auto">
          {isOutOfStock ? (
            <Button variant="outline" className="w-full opacity-50" disabled>
              Out of Stock
            </Button>
          ) : (
            <Button variant="primary" className="w-full opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              + Buy
            </Button>
          )}
        </div>
      </div>
    </Link>
  )
}
