"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

export function AdminListingsActions({ productId }: { productId: string }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleApprove = async () => {
    setIsProcessing(true)
    const res = await fetch('/api/admin/approve-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    })

    if (res.ok) {
      toast.success("Listing approved!")
      router.push("/admin/listings")
    } else {
      toast.error("Failed to approve listing.")
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason) {
      toast.error("Please provide a rejection reason.")
      return
    }

    setIsProcessing(true)
    const res = await fetch('/api/admin/reject-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, reason: rejectReason })
    })

    if (res.ok) {
      toast.success("Listing rejected.")
      router.push("/admin/listings")
    } else {
      toast.error("Failed to reject listing.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="mt-8 space-y-4 rounded-2xl bg-surface-alt p-6">
      <h3 className="font-bold text-ink">Moderation Actions</h3>
      
      <div className="flex gap-4">
        <Button onClick={handleApprove} variant="primary" disabled={isProcessing}>
          Approve Listing
        </Button>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <label className="block text-sm font-medium text-ink mb-2">Reject with Reason</label>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection (sent to seller)..."
          className="w-full rounded-lg border border-border p-3 mb-4 focus:border-danger focus:outline-none"
          rows={3}
        />
        <Button onClick={handleReject} variant="outline" className="text-danger hover:bg-danger/10 border-danger" disabled={isProcessing}>
          Reject Listing
        </Button>
      </div>
    </div>
  )
}
