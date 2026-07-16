"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sellScrapSchema, type SellScrapInput } from "@/lib/validators/product"
import { createClient } from "@/lib/supabase/client"
import { uploadProductImage } from "@/app/actions/uploadImage"
import { submitProductAction } from "@/app/actions/submitProduct"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Category = {
  id: string
  name: string
}

export function SellScrapForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sellScrapSchema),
  })

  const onSubmit = async (data: SellScrapInput) => {
    setIsSubmitting(true)
    let imageUrl = ""

    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to sell items.")
        setIsSubmitting(false)
        return
      }

      // 2. Upload image if provided
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        
        const { url, error } = await uploadProductImage(formData)
        
        if (error) {
          throw new Error("Failed to upload image: " + error)
        }
        
        if (url) {
          imageUrl = url
        }
      }

      // 3. Insert product using server action to bypass RLS/FK issues
      const submitResult = await submitProductAction({
        ...data,
        imageUrl: imageUrl || null
      })

      if (submitResult.error) {
        console.error("Insert error details:", submitResult.error)
        throw new Error(submitResult.error)
      }

      toast.success("Product listed successfully! It is now live in the shop.")
      router.push("/dashboard/profile")
      
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-border bg-surface p-8 shadow-sm">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Title */}
        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">Title</label>
          <input
            {...register("title")}
            type="text"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Honda Civic 2018 Front Bumper"
          />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Category</label>
          <select
            {...register("category_id")}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && <p className="mt-1 text-xs text-danger">{errors.category_id.message}</p>}
        </div>

        {/* Condition */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Condition</label>
          <select
            {...register("condition")}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select condition</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
          {errors.condition && <p className="mt-1 text-xs text-danger">{errors.condition.message}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Price (₹)</label>
          <input
            {...register("price")}
            type="number"
            step="0.01"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="0.00"
          />
          {errors.price && <p className="mt-1 text-xs text-danger">{errors.price.message}</p>}
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Quantity in Stock</label>
          <input
            {...register("stock_qty")}
            type="number"
            step="1"
            min="1"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="1"
            defaultValue={1}
          />
          {errors.stock_qty && <p className="mt-1 text-xs text-danger">{errors.stock_qty.message}</p>}
        </div>

        {/* Vehicle Make */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Vehicle Make (Optional)</label>
          <input
            {...register("vehicle_make")}
            type="text"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Honda"
          />
        </div>

        {/* Vehicle Model */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Vehicle Model (Optional)</label>
          <input
            {...register("vehicle_model")}
            type="text"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Civic"
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Describe the part, its condition, and any defects..."
          />
          {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
        </div>

        {/* Image Upload */}
        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImageFile(e.target.files[0])
              }
            }}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "List Part for Sale"}
        </Button>
      </div>
    </form>
  )
}
