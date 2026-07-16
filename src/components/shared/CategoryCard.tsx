import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface CategoryCardProps {
  title: string
  description: string
  imageUrl: string
  href: string
}

export function CategoryCard({ title, description, imageUrl, href }: CategoryCardProps) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-2xl bg-surface shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden bg-surface-alt">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">No Image</div>
        )}
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-transform group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-ink">{title}</h3>
        <p className="mt-1 truncate text-sm text-muted">{description}</p>
      </div>
    </Link>
  )
}
