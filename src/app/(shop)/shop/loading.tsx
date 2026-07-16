import { Skeleton } from "@/components/ui/Skeleton"

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-6 w-96 rounded-lg" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </aside>

        <div className="flex-1 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-6 w-1/4 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
