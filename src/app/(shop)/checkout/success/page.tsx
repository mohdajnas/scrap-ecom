"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string }
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success"
      >
        <CheckCircle2 className="h-12 w-12" />
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-3xl font-bold text-ink"
      >
        Order Placed Successfully!
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {searchParams.ref && (
          <p className="mb-6 text-sm font-medium text-muted">
            Order Reference: <span className="font-mono font-bold text-primary text-base">{searchParams.ref}</span>
          </p>
        )}
        
        <p className="mb-8 text-muted">
          Thank you for shopping with Patshell Trading. We will contact you shortly to confirm the delivery details for your order.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="outline" className="transition-transform hover:scale-105 active:scale-95">View My Orders</Button>
          </Link>
          <Link href="/">
            <Button variant="primary" className="transition-transform hover:scale-105 active:scale-95">Continue Shopping</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
