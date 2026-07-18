"use server"

import { createClient } from "@/lib/supabase/server"
import { SellScrapInput, sellScrapSchema } from "@/lib/validators/product"

export async function updateProductAction(
  productId: string,
  data: SellScrapInput & { imageUrl: string | null }
) {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Not authenticated" }
    }

    const validatedData = sellScrapSchema.parse(data)

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('seller_id, images')
      .eq('id', productId)
      .single()

    if (fetchError || !existing) {
      return { error: "Product not found" }
    }

    if (existing.seller_id !== user.id) {
      return { error: "Unauthorized" }
    }

    let images = existing.images || []
    if (data.imageUrl) {
      images = [data.imageUrl]
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        condition: validatedData.condition,
        category_id: validatedData.category_id,
        vehicle_make: validatedData.vehicle_make || null,
        vehicle_model: validatedData.vehicle_model || null,
        stock_qty: validatedData.stock_qty,
        images: images,
      })
      .eq('id', productId)
      .eq('seller_id', user.id)

    if (updateError) {
      return { error: updateError.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update product" }
  }
}
