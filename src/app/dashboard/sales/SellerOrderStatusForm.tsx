"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SellerOrderStatusForm({ itemId, currentStatus }: { itemId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch('/api/seller/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status")
      }

      toast.success("Status updated successfully")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select 
        value={status} 
        onChange={(e) => setStatus(e.target.value)}
        className="flex-1 rounded-lg border border-border px-3 py-2 text-sm bg-white focus:border-primary focus:outline-none"
      >
        <option value="placed">Placed</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button 
        onClick={handleUpdate}
        disabled={isUpdating || status === currentStatus}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUpdating ? "..." : "Save"}
      </button>
    </div>
  )
}
