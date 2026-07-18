"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AddToCartButton({ productId }: { productId: string }) {
  const [isAdding, setIsAdding] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkCart() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("cart_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .maybeSingle()
        
        if (data) {
          setIsInCart(true)
        }
      }
      setIsLoading(false)
    }
    checkCart()
  }, [supabase, productId])

  const handleAdd = async () => {
    if (isInCart) {
      router.push("/cart")
      return
    }

    setIsAdding(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please log in to add items to your cart.")
      router.push("/login")
      setIsAdding(false)
      return
    }

    const { error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1
      })

    if (error) {
      if (error.code === '23505') {
        toast.error(`Unique Conflict: ${error.message} | Details: ${error.details}`)
        setIsInCart(true)
      } else {
        toast.error("Failed to add to cart.")
      }
      setIsAdding(false)
      return
    } else {
      toast.success("Added to cart!")
      setIsInCart(true)
      window.dispatchEvent(new Event("cartUpdated"))
      router.refresh()
    }
    
    setIsAdding(false)
  }

  return (
    <Button onClick={handleAdd} variant={isInCart ? "outline" : "primary"} size="lg" className="w-full" disabled={isAdding || isLoading}>
      {isLoading ? "Loading..." : isAdding ? "Adding..." : isInCart ? "Go to cart" : "Add to Cart"}
    </Button>
  )
}
