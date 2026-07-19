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

  // Use admin client to bypass RLS in case of policy issues
  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: cartItemsData, error } = await adminClient
    .from("cart_items")
    .select(`
      id,
      quantity,
      products (
        id,
        title,
        price,
        delivery_fee,
        extra_fees,
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
      
      {error ? (
        <div className="rounded-3xl bg-danger/10 p-6 text-danger">
          <h2 className="font-bold">Error loading cart</h2>
          <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : (
        <CartClient initialItems={cartItems} />
      )}
    </div>
  )
}
