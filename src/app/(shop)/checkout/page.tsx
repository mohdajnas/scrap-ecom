"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [address, setAddress] = useState({
    full_name: "",
    phone_number: "",
    apartment: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India"
  })
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online")
  
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
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shipping_address: address,
          payment_method: paymentMethod
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        toast.error("No redirect URL returned from payment gateway.")
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!userProfile) return <div className="py-20 text-center">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-surface p-8 shadow-soft"
      >
        <h1 className="text-3xl font-bold text-ink">Checkout</h1>
        <p className="mt-2 text-muted">Complete your purchase securely.</p>

        <form onSubmit={handlePayment} className="mt-8 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-ink">Shipping Address</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                required
                type="text"
                placeholder="Full Name"
                value={address.full_name}
                onChange={e => setAddress({...address, full_name: e.target.value})}
                className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none bg-surface-alt"
              />
              <input
                required
                type="tel"
                placeholder="Phone Number"
                value={address.phone_number}
                onChange={e => setAddress({...address, phone_number: e.target.value})}
                className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none bg-surface-alt"
              />
            </div>
            
            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              value={address.apartment}
              onChange={e => setAddress({...address, apartment: e.target.value})}
              className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none bg-surface-alt"
            />

            <input
              required
              type="text"
              placeholder="Street Address"
              value={address.street}
              onChange={e => setAddress({...address, street: e.target.value})}
              className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none bg-surface-alt"
            />

            <input
              type="text"
              placeholder="Landmark (optional)"
              value={address.landmark}
              onChange={e => setAddress({...address, landmark: e.target.value})}
              className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none bg-surface-alt"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="City"
                value={address.city}
                onChange={e => setAddress({...address, city: e.target.value})}
                className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none bg-surface-alt"
              />
              <input
                required
                type="text"
                placeholder="State"
                value={address.state}
                onChange={e => setAddress({...address, state: e.target.value})}
                className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none bg-surface-alt"
              />
            </div>
            <input
              required
              type="text"
              placeholder="Postal Code"
              value={address.postal_code}
              onChange={e => setAddress({...address, postal_code: e.target.value})}
              className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none bg-surface-alt"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-ink">Payment Method</h3>
            <div className="flex flex-col gap-3">
              <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="h-4 w-4 text-primary"
                />
                <div>
                  <p className="font-medium text-ink">Pay Online</p>
                  <p className="text-sm text-muted">Credit/Debit Card, UPI, Netbanking</p>
                </div>
              </label>
              
              <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="h-4 w-4 text-primary"
                />
                <div>
                  <p className="font-medium text-ink">Cash on Delivery</p>
                  <p className="text-sm text-muted">Pay with cash when your order arrives</p>
                </div>
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]" disabled={isProcessing}>
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : paymentMethod === 'cod' ? "Place Order" : "Proceed to Payment"}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
