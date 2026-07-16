"use client"

import { useState, useEffect } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India"
  })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setUserProfile({ ...user, ...profile })
      } else {
        router.push('/login?next=/checkout')
      }
    }
    loadUser()
  }, [router, supabase])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      // 1. Create order on the server
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping_address: address })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // 2. Open Razorpay Widget
      const options = {
        key: data.key_id, // Sent from server, safe for client
        amount: data.amount,
        currency: data.currency,
        name: "Patshell Trading",
        description: "Order Payment",
        order_id: data.razorpay_order_id,
        handler: async function (response: any) {
          // 3. Verify payment on server
          toast.loading("Verifying payment...", { id: 'verify' })
          
          const verifyRes = await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          })
          
          const verifyData = await verifyRes.json()
          
          if (verifyRes.ok && verifyData.success) {
            toast.success("Payment successful!", { id: 'verify' })
            router.push(`/order/confirmation/${verifyData.orderId}`)
          } else {
            toast.error(verifyData.error || "Payment verification failed", { id: 'verify' })
          }
        },
        prefill: {
          name: userProfile?.full_name || "",
          email: userProfile?.email || "",
        },
        theme: {
          color: "#7C3AED",
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description)
      })
      rzp.open()

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!userProfile) return <div className="py-20 text-center">Loading...</div>

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-3xl bg-surface p-8 shadow-soft">
          <h1 className="text-3xl font-bold text-ink">Checkout</h1>
          <p className="mt-2 text-muted">Complete your purchase securely.</p>

          <form onSubmit={handlePayment} className="mt-8 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-ink">Shipping Address</h3>
              
              <input
                required
                type="text"
                placeholder="Street Address"
                value={address.street}
                onChange={e => setAddress({...address, street: e.target.value})}
                className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={e => setAddress({...address, city: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
                <input
                  required
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={e => setAddress({...address, state: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
              <input
                required
                type="text"
                placeholder="Postal Code"
                value={address.postal_code}
                onChange={e => setAddress({...address, postal_code: e.target.value})}
                className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
