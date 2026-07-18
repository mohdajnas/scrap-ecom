"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('Verifying your payment...')

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (!ref) {
      setStatus('Invalid request. No reference found.')
      return
    }

    async function verify() {
      try {
        const res = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientReferenceId: ref })
        })

        const data = await res.json()
        if (res.ok && data.success) {
          setStatus('Payment verified! Redirecting...')
          setTimeout(() => {
            router.push(`/order/confirmation/${data.orderId}`)
          }, 1500)
        } else {
          setStatus(`Verification failed: ${data.error || data.status || 'Unknown error'}`)
        }
      } catch (err: any) {
        setStatus(`Verification error: ${err.message}`)
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      {status.includes('Verifying') || status.includes('Redirecting') ? (
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      ) : null}
      <h2 className="text-xl font-medium text-ink">{status}</h2>
    </div>
  )
}
