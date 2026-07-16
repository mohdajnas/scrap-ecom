import { Star, StarHalf } from "lucide-react"

export function RatingStars({ rating, count }: { rating: number, count?: number }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0

  return (
    <div className="flex items-center gap-1 text-warning">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className="h-4 w-4 fill-warning" />
        } else if (i === fullStars && hasHalfStar) {
          return <StarHalf key={i} className="h-4 w-4 fill-warning" />
        }
        return <Star key={i} className="h-4 w-4 text-muted/30" />
      })}
      {count !== undefined && (
        <span className="ml-1 text-xs text-muted">({count})</span>
      )}
    </div>
  )
}
