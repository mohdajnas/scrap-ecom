"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Grid, List, Edit, Trash2, Eye } from "lucide-react"
import { PriceTag } from "@/components/shared/PriceTag"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

type Product = {
  id: string
  title: string
  price: number
  stock_qty: number
  images: string[]
  status: string
}

export function ProductListClient({ products: initialProducts }: { products: Product[] }) {
  const router = useRouter()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [products, setProducts] = useState(initialProducts)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const getDisplayStatus = (product: Product) => {
    if (product.status === 'pending') return { text: 'Pending', color: 'bg-warning/10 text-warning' }
    if (product.status === 'rejected') return { text: 'Rejected', color: 'bg-danger/10 text-danger' }
    if (product.stock_qty <= 0) return { text: 'Out of Stock', color: 'bg-danger/10 text-danger' }
    return { text: 'Live', color: 'bg-success/10 text-success' }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return

    setIsDeleting(id)
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Failed to delete product")
      
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success("Product deleted successfully")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setIsDeleting(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl bg-surface-alt py-20 text-center">
        <p className="text-muted">You haven&apos;t listed any products yet.</p>
        <Link href="/dashboard/products/new" className="mt-4 inline-block font-semibold text-primary hover:underline">
          Start Selling
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* View Toggles */}
      <div className="mb-6 flex justify-end">
        <div className="flex rounded-lg bg-surface p-1 shadow-sm">
          <button
            onClick={() => setView('grid')}
            className={`rounded-md p-2 transition-colors ${view === 'grid' ? 'bg-primary text-white shadow' : 'text-muted hover:text-ink'}`}
            title="Grid View"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded-md p-2 transition-colors ${view === 'list' ? 'bg-primary text-white shadow' : 'text-muted hover:text-ink'}`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col overflow-hidden rounded-2xl bg-surface shadow-soft transition-shadow hover:shadow-md">
              <div className="relative aspect-video w-full bg-surface-alt">
                {product.images && product.images[0] ? (
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">No image</div>
                )}
                <div className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${getDisplayStatus(product).color}`}>
                  {getDisplayStatus(product).text}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 font-semibold text-ink mb-2">{product.title}</h3>
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted mb-1">Stock: {product.stock_qty || 0}</p>
                    <p className="font-bold text-primary">
                      <PriceTag amount={product.price} />
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/product/${product.id}`} className="rounded p-1.5 text-muted hover:bg-surface-alt hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link href={`/dashboard/products/${product.id}/edit`} className="rounded p-1.5 text-muted hover:bg-surface-alt hover:text-primary">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting === product.id}
                      className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col sm:flex-row items-center gap-4 overflow-hidden rounded-2xl bg-surface p-4 shadow-soft transition-shadow hover:shadow-md">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                {product.images && product.images[0] ? (
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted">No img</div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center sm:min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDisplayStatus(product).color}`}>
                    {getDisplayStatus(product).text}
                  </div>
                </div>
                <h3 className="truncate font-semibold text-ink">{product.title}</h3>
                <div className="mt-1 flex items-center gap-4 text-sm">
                  <p className="text-muted">Stock: <span className="font-medium text-ink">{product.stock_qty || 0}</span></p>
                  <p className="font-bold text-primary"><PriceTag amount={product.price} /></p>
                </div>
              </div>
              <div className="flex w-full sm:w-auto items-center justify-end gap-2 border-t pt-4 sm:border-0 sm:pt-0">
                <Link href={`/product/${product.id}`}>
                  <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4"/> View</Button>
                </Link>
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-2"><Edit className="h-4 w-4"/> Edit</Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(product.id)}
                  disabled={isDeleting === product.id}
                  className="gap-2 text-danger hover:bg-danger hover:text-white border-danger"
                >
                  <Trash2 className="h-4 w-4"/> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
