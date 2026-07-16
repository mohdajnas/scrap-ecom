"use client"

import { useState, useEffect, useTransition } from "react"
import { Search, ShoppingCart, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function NavbarActions() {
  const router = useRouter()
  const supabase = createClient()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPending, startTransition] = useTransition()
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    let cartSubscription: ReturnType<typeof supabase.channel> | null = null;

    async function checkAuthAndCart() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setIsAuthenticated(true)
        
        // Fetch cart count
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          
        setCartItemCount(count || 0)

        // Setup real-time listener for cart changes
        const channelName = `cart_changes_${Math.random()}`
        cartSubscription = supabase.channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cart_items',
              filter: `user_id=eq.${session.user.id}`
            },
            async () => {
              const { count: newCount } = await supabase
                .from("cart_items")
                .select("*", { count: "exact", head: true })
                .eq("user_id", session.user.id)
              setCartItemCount(newCount || 0)
            }
          )
          .subscribe()
      }
      setIsFetching(false)
    }
    
    checkAuthAndCart()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true)
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
        setCartItemCount(count || 0)
        
        if (!cartSubscription) {
          const channelName = `cart_changes_${Math.random()}`
          cartSubscription = supabase.channel(channelName)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'cart_items',
                filter: `user_id=eq.${session.user.id}`
              },
              async () => {
                const { count: newCount } = await supabase
                  .from("cart_items")
                  .select("*", { count: "exact", head: true })
                  .eq("user_id", session.user.id)
                setCartItemCount(newCount || 0)
              }
            )
            .subscribe()
        }
      } else {
        setIsAuthenticated(false)
        setCartItemCount(0)
        if (cartSubscription) {
          supabase.removeChannel(cartSubscription)
          cartSubscription = null
        }
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
      if (cartSubscription) {
        supabase.removeChannel(cartSubscription)
      }
    }
  }, [supabase])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      startTransition(() => {
        router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      })
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Search Toggle / Form */}
      {isSearchOpen ? (
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            autoFocus
            placeholder="Search parts..."
            className="h-9 w-48 rounded-full border border-border bg-surface-alt px-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              if (!searchQuery) setIsSearchOpen(false)
            }}
          />
          <button type="submit" className="absolute right-3 text-muted hover:text-primary" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsSearchOpen(true)}
          className="text-ink transition-colors hover:text-primary"
          title="Search"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </button>
      )}

      {/* Cart */}
      <Link href="/cart" className="relative text-ink transition-colors hover:text-primary" title="Cart">
        <ShoppingCart className="h-5 w-5" />
        {cartItemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {cartItemCount}
          </span>
        )}
      </Link>
      
      {/* Profile */}
      <Link
        href={isAuthenticated ? "/dashboard/profile" : "/login"}
        className="text-ink transition-colors hover:text-primary"
        title={isAuthenticated ? "Profile" : "Log in"}
      >
        <User className="h-5 w-5" />
      </Link>
      
      {/* Shop Now Button */}
      <Link href="/shop" className="hidden md:inline-flex">
        <Button variant="primary">
          Shop Now
        </Button>
      </Link>
    </div>
  )
}
