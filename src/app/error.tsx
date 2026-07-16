"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/Button"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-ink">Something went wrong!</h2>
      <p className="mt-2 text-muted">We encountered an unexpected error while loading this page.</p>
      
      <div className="mt-8 flex gap-4">
        <Button onClick={() => reset()} variant="primary">
          Try again
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Return Home
        </Button>
      </div>
    </div>
  )
}
