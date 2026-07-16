import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CartClient } from "@/components/cart/CartClient"

export const revalidate = 0

export default async function CartPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/cart")
  }

  // Fetch cart items for user
  const { data: cartItemsData } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      products (
        id,
        title,
        price,
        images
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const cartItems = (cartItemsData || []).map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    product: item.products
  }))

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink md:text-5xl">Your Cart</h1>
      </div>
      
      <CartClient initialItems={cartItems} />
    </div>
  )
}
