import { Button } from "@/components/ui/Button"
import { ShieldCheck, CreditCard, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-20 text-center">
      
      {/* Top Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-ink md:text-7xl lg:text-[5.5rem] leading-[1.05]">
          Find and sell auto parts with PatShell
        </h1>
        
        <p className="max-w-2xl text-lg text-muted md:text-xl mt-4">
          We are here ready to help you in finding and selling high-quality second-hand vehicle parts.
        </p>
        
        <Link href="/shop" className="mt-4 relative z-10">
          <Button size="lg" className="rounded-lg px-8 py-6 text-lg font-bold shadow-sm bg-primary hover:bg-primary-dark text-white border-none transition-colors">
            Get Started
          </Button>
        </Link>
      </div>

      {/* Hero Illustration */}
      <div className="relative z-0 -mt-16 sm:-mt-24 md:-mt-32 lg:-mt-40 xl:-mt-48 w-[calc(100%+3rem)] -ml-6 md:w-[calc(100%+6rem)] md:-ml-12 lg:w-[calc(100%+12rem)] lg:-ml-24 max-w-[100vw]">
        <Image
          src="/heroo.webp"
          alt="PatShell Auto Parts Marketplace"
          width={2048}
          height={2048}
          className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover object-center"
          priority
        />
      </div>

      {/* Services Section */}
      <div className="mt-32">
        <h2 className="mb-12 text-3xl font-bold tracking-tight text-ink md:text-4xl text-center">
          Our Service
        </h2>
        
        <div className="grid gap-10 sm:grid-cols-3 text-center">
          {/* Service 1 */}
          <div className="flex flex-col items-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-ink">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-ink">Verified Quality</h3>
            <p className="text-muted max-w-xs">
              Every part on our platform goes through strict quality checks to ensure reliability and safety.
            </p>
          </div>

          {/* Service 2 */}
          <div className="flex flex-col items-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-ink">
              <CreditCard className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-ink">Secure Payments</h3>
            <p className="text-muted max-w-xs">
              Shop with confidence using our encrypted and fully protected payment gateways.
            </p>
          </div>

          {/* Service 3 */}
          <div className="flex flex-col items-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-ink">
              <Truck className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-ink">Nationwide Delivery</h3>
            <p className="text-muted max-w-xs">
              Fast and trackable shipping options directly to your doorstep, anywhere in the country.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
