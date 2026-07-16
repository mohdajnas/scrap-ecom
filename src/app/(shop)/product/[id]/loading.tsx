import { Skeleton } from "@/components/ui/Skeleton"

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left: Image Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>
        </div>

        {/* Right: Product Info Skeleton */}
        <div className="flex flex-col">
          <Skeleton className="mb-2 h-6 w-24 rounded-full" />
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="mb-6 h-8 w-32" />

          <div className="mb-8 border-y border-border py-6">
            <Skeleton className="mb-4 h-6 w-48" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          <div className="rounded-2xl bg-surface-alt p-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
