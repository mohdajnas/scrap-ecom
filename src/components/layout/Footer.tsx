import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-surface-alt py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <span className="text-2xl font-bold tracking-tighter text-primary">Patshell Trading</span>
            <p className="mt-4 text-sm text-muted">
              The premium marketplace for certified, high-quality second-hand vehicle parts.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ink">Marketplace</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link href="/shop">All Parts</Link></li>
              <li><Link href="/categories">Categories</Link></li>
              <li><Link href="/dashboard/products/new">Sell Scrap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink">Support</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/returns">Returns Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>
                <a href="mailto:patshelltrading@gmail.com" className="hover:text-primary">
                  patshelltrading@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+916357606081" className="hover:text-primary">
                  +91 63576 06081
                </a>
              </li>
              <li className="leading-relaxed">
                SF-7, Shivalaya 2,<br />
                Above Muthoot Finance,<br />
                Vadodara, 390007
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} Patshell Trading. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
