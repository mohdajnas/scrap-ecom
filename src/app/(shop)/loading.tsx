export default function GlobalLoading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary/30" />
        {/* Inner pulsing logo */}
        <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-primary text-white shadow-lg">
          <span className="text-xl font-black italic">P</span>
        </div>
      </div>
      <p className="animate-pulse text-sm font-medium tracking-wider text-muted">LOADING...</p>
    </div>
  )
}
