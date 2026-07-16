import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { Shield, Leaf, Users, Coins } from "lucide-react"

export const metadata = {
  title: "About Us | Patshell Trading",
  description: "Transforming India's Scrap Economy",
}

export default function AboutPage() {
  return (
    <div className="flex flex-col pb-16">
      {/* Hero Section */}
      <section className="bg-surface-alt px-6 py-20 text-center md:py-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-ink md:text-6xl">
            About PatShell
          </h1>
          <p className="mt-6 text-xl text-muted md:text-2xl">
            Transforming India&apos;s Scrap Economy
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted md:text-lg">
            India&apos;s largest marketplace connecting scrap sellers with buyers, making recycling accessible, transparent, and profitable for everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Our Mission
            </h2>
            <h3 className="mt-2 text-xl font-semibold text-primary">
              Making Recycling Simple &amp; Rewarding
            </h3>
            <div className="mt-6 space-y-4 text-muted">
              <p>
                PatShell was founded with a vision to revolutionize how India handles scrap materials. We believe that every piece of scrap has value and should find its way back into the production cycle.
              </p>
              <p>
                Our platform bridges the gap between sellers and buyers, offering transparent pricing, verified listings, and nationwide reach. From electronic parts to metal scrap, we&apos;re building a sustainable future, one transaction at a time.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-3xl bg-surface-alt p-8">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-surface p-6 text-center shadow-soft">
              <span className="text-3xl font-bold text-primary">2,500+</span>
              <span className="mt-2 text-sm text-muted">Active Sellers</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-surface p-6 text-center shadow-soft">
              <span className="text-3xl font-bold text-primary">50K+</span>
              <span className="mt-2 text-sm text-muted">Tons Traded</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-surface p-6 text-center shadow-soft">
              <span className="text-3xl font-bold text-primary">104+</span>
              <span className="mt-2 text-sm text-muted">Product Categories</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-surface p-6 text-center shadow-soft">
              <span className="text-3xl font-bold text-primary">98%</span>
              <span className="mt-2 text-sm text-muted">Customer Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-surface-alt px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-muted">
              What Drives Us Forward
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-muted">
              Our core values shape every decision we make and every feature we build
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-surface p-8 shadow-soft">
              <Leaf className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-bold text-ink">Sustainability</h3>
              <p className="text-muted">
                Promoting circular economy through efficient scrap trading and recycling
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-8 shadow-soft">
              <Shield className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-bold text-ink">Trust &amp; Safety</h3>
              <p className="text-muted">
                Verified sellers and secure transactions for peace of mind
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-8 shadow-soft">
              <Users className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-bold text-ink">Community First</h3>
              <p className="text-muted">
                Building a network of responsible buyers and sellers across India
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-8 shadow-soft">
              <Coins className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-bold text-ink">Fair Pricing</h3>
              <p className="text-muted">
                Transparent market rates ensuring value for all stakeholders
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto w-full max-w-4xl px-6 py-16 text-center md:py-24">
        <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Join Our Growing Community
        </h2>
        <p className="mt-4 text-lg text-muted">
          Whether you&apos;re buying or selling, PatShell makes it easy to participate in India&apos;s circular economy
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/shop">
            <Button variant="primary" className="w-full px-8 sm:w-auto">
              Start Browsing
            </Button>
          </Link>
          <Link href="/dashboard/products/new">
            <Button variant="outline" className="w-full px-8 sm:w-auto">
              List Your Scrap
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
