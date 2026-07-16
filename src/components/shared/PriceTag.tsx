export function PriceTag({ amount, currency = "INR" }: { amount: number, currency?: string }) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount)

  return (
    <span className="font-bold text-ink">
      {formatted}
    </span>
  )
}
