"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sellScrapSchema, type SellScrapInput } from "@/lib/validators/product"
import { createClient } from "@/lib/supabase/client"
import { uploadProductImage } from "@/app/actions/uploadImage"
import { updateProductAction } from "@/app/actions/updateProduct"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Category = {
  id: string
  name: string
}

export function EditScrapForm({ 
  categories, 
  initialData 
}: { 
  categories: Category[]
  initialData: any
}) {
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
    defaultValues: {
      title: initialData.title || "",
      description: initialData.description || "",
      price: initialData.price || 0,
      condition: initialData.condition || "used",
      category_id: initialData.category_id || "",
      vehicle_make: initialData.vehicle_make || "",
      vehicle_model: initialData.vehicle_model || "",
      stock_qty: initialData.stock_qty || 1,
      delivery_fee: initialData.delivery_fee || 0,
      extra_fees: initialData.extra_fees || 0,
    }
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

      // 3. Update product using server action
      const submitResult = await updateProductAction(initialData.id, {
        ...data,
        imageUrl: imageUrl || null
      })

      if (submitResult.error) {
        console.error("Update error details:", submitResult.error)
        throw new Error(submitResult.error)
      }

      toast.success("Product updated successfully!")
      router.push("/dashboard/products")
      
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 col-span-2 md:col-span-1">
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

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Delivery Fee (₹)</label>
            <input
              {...register("delivery_fee")}
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="0.00"
              defaultValue={0}
            />
            {errors.delivery_fee && <p className="mt-1 text-xs text-danger">{errors.delivery_fee.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Platform/Extra Fees (₹)</label>
            <input
              {...register("extra_fees")}
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="0.00"
              defaultValue={0}
            />
            {errors.extra_fees && <p className="mt-1 text-xs text-danger">{errors.extra_fees.message}</p>}
          </div>
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Quantity in Stock</label>
          <input
            {...register("stock_qty")}
            type="number"
            step="1"
            min="0"
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
                <div className="text-center">
                  <span className="mb-2 block text-sm font-medium text-ink">Select a new image to replace</span>
                  <span className="text-xs text-muted block">Current image will be kept if none selected.</span>
                </div>
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
          {isSubmitting ? "Updating Product..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
