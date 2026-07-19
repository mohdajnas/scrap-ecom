"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { PriceTag } from "@/components/shared/PriceTag"
import { Trash2, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type CartItemType = {
  id: string
  quantity: number
  product: {
    id: string
    title: string
    price: number
    delivery_fee: number
    extra_fees: number
    images: string[]
  }
}

export function CartClient({ initialItems }: { initialItems: CartItemType[] }) {
  const [items, setItems] = useState<CartItemType[]>(initialItems)
  const supabase = createClient()
  const router = useRouter()

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  const totalDeliveryFee = items.reduce((acc, item) => acc + ((item.product.delivery_fee || 0) * item.quantity), 0)
  const totalExtraFees = items.reduce((acc, item) => acc + ((item.product.extra_fees || 0) * item.quantity), 0)
  const grandTotal = subtotal + totalDeliveryFee + totalExtraFees

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    // Optimistic update
    setItems(items.map(i => i.id === cartItemId ? { ...i, quantity: newQuantity } : i))

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", cartItemId)

    if (error) {
      toast.error("Failed to update quantity.")
      router.refresh() // Revert state
    }
  }

  const removeItem = async (cartItemId: string) => {
    setItems(items.filter(i => i.id !== cartItemId))

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)

    if (error) {
      toast.error("Failed to remove item.")
      router.refresh()
    } else {
      toast.success("Item removed")
      router.refresh() // Update navbar badge
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-surface-alt py-20 text-center">
        <h2 className="text-2xl font-bold text-ink">Your cart is empty</h2>
        <p className="mt-2 text-muted">Looks like you haven&apos;t added any parts yet.</p>
        <Link href="/shop" className="mt-6">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ul className="divide-y divide-border rounded-2xl bg-surface shadow-soft">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                {item.product.images?.[0] && (
                  <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                )}
              </div>
              
              <div className="flex flex-1 flex-col">
                <Link href={`/product/${item.product.id}`} className="font-semibold text-ink hover:text-primary">
                  {item.product.title}
                </Link>
                <div className="mt-1 font-bold text-primary">
                  <PriceTag amount={item.product.price} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 sm:justify-end">
                <div className="flex items-center rounded-full border border-border">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-l-full text-muted transition-colors hover:bg-surface-alt hover:text-ink"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-r-full text-muted transition-colors hover:bg-surface-alt hover:text-ink"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  className="rounded-full p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl bg-surface p-6 shadow-soft">
          <h3 className="text-lg font-bold text-ink">Order Summary</h3>
          
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-medium text-ink"><PriceTag amount={subtotal} /></span>
            </div>
            {totalDeliveryFee > 0 && (
              <div className="flex justify-between text-muted">
                <span>Delivery Fee</span>
                <span className="font-medium text-ink"><PriceTag amount={totalDeliveryFee} /></span>
              </div>
            )}
            {totalExtraFees > 0 && (
              <div className="flex justify-between text-muted">
                <span>Platform/Extra Fees</span>
                <span className="font-medium text-ink"><PriceTag amount={totalExtraFees} /></span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-4 text-base font-bold text-ink">
              <span>Total</span>
              <span className="text-primary"><PriceTag amount={grandTotal} /></span>
            </div>
          </div>

          <Link href="/checkout" className="mt-8 block">
            <Button variant="primary" size="lg" className="w-full">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
