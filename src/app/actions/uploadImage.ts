"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function uploadProductImage(formData: FormData): Promise<{ url?: string, error?: string }> {
  try {
    const file = formData.get("file") as File
    if (!file) return { error: "No file provided" }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Use admin client to bypass RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(filePath, buffer, { 
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error("Admin upload error:", uploadError)
      return { error: uploadError.message }
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(filePath)

    return { url: publicUrlData.publicUrl }
  } catch (err: any) {
    return { error: err.message }
  }
}
