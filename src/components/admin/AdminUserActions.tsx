"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

export function AdminUserActions({ userId, isBanned }: { userId: string, isBanned: boolean }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const toggleBan = async () => {
    setIsProcessing(true)
    const res = await fetch('/api/admin/ban-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: userId, banStatus: !isBanned })
    })

    if (res.ok) {
      toast.success(`User ${!isBanned ? 'banned' : 'unbanned'} successfully.`)
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to update user status.")
    }
    setIsProcessing(false)
  }

  return (
    <Button 
      onClick={toggleBan} 
      variant={isBanned ? "outline" : "primary"} 
      className={isBanned ? "" : "bg-danger hover:bg-danger/90 border-danger"}
      disabled={isProcessing}
      size="sm"
    >
      {isProcessing ? "Processing..." : (isBanned ? "Unban User" : "Ban User")}
    </Button>
  )
}
