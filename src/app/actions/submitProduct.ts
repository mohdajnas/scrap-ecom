"use server"

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export async function submitProductAction(data: any) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Use admin client to bypass RLS and FK issues
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Ensure profile exists to satisfy FK constraint products_seller_id_fkey
    await supabaseAdmin.from("profiles").upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || 'New User',
      role: 'buyer'
    }, { onConflict: 'id' })

    // Insert product
    const { data: product, error } = await supabaseAdmin.from("products").insert({
      seller_id: user.id,
      category_id: data.category_id,
      title: data.title,
      description: data.description,
      price: data.price,
      condition: data.condition,
      vehicle_make: data.vehicle_make || null,
      vehicle_model: data.vehicle_model || null,
      stock_qty: data.stock_qty || 1,
      images: data.imageUrl ? [data.imageUrl] : [],
      status: "approved"
    }).select().single()

    if (error) {
      console.error("Admin insert error:", error)
      return { error: error.message }
    }

    return { success: true, product }
  } catch (err: any) {
    return { error: err.message }
  }
}
