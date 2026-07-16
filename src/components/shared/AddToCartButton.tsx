"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AddToCartButton({ productId }: { productId: string }) {
  const [isAdding, setIsAdding] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleAdd = async () => {
    setIsAdding(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please log in to add items to your cart.")
      router.push("/login")
      setIsAdding(false)
      return
    }

    // Try to insert; if it conflicts (already in cart), we could update quantity.
    // For simplicity, we just do a standard insert and rely on the UI/DB to handle duplicates.
    const { error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1
      })

    if (error) {
      if (error.code === '23505') {
        toast.info("Item is already in your cart!")
      } else {
        toast.error("Failed to add to cart.")
      }
    } else {
      toast.success("Added to cart!")
      router.refresh() // Refreshes server components like navbar cart badge
    }
    
    setIsAdding(false)
  }

  return (
    <Button onClick={handleAdd} variant="primary" size="lg" className="w-full" disabled={isAdding}>
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  )
}
