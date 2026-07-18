import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EditScrapForm } from "@/components/dashboard/EditScrapForm"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink">Product not found</h1>
        <p className="mt-2 text-muted">The product you are trying to edit does not exist or you do not have permission.</p>
        <Link href="/dashboard/products" className="mt-6 inline-block text-primary hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    )
  }

  if (product.seller_id !== user.id) {
    redirect("/dashboard/products")
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard/products" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>
      
      <h1 className="mb-8 text-3xl font-bold text-ink">Edit Product: {product.title}</h1>
      
      <EditScrapForm categories={categories || []} initialData={product} />
    </div>
  )
}
