"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

export function AdminOrderActions({ orderId, status }: { orderId: string, status: string }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRefund = async () => {
    if (!confirm("Are you sure you want to issue a full refund for this order?")) return

    setIsProcessing(true)
    const res = await fetch('/api/admin/refund-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    })

    if (res.ok) {
      toast.success(`Refund issued successfully.`)
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to process refund.")
    }
    setIsProcessing(false)
  }

  if (status !== 'paid') {
    return <span className="text-muted text-sm">N/A</span>
  }

  return (
    <Button 
      onClick={handleRefund} 
      variant="outline"
      className="text-danger hover:bg-danger/10 border-danger"
      disabled={isProcessing}
      size="sm"
    >
      {isProcessing ? "Processing..." : "Issue Refund"}
    </Button>
  )
}
