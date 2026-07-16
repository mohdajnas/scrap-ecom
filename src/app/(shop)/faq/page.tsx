export const metadata = {
  title: "FAQ | Patshell Trading",
  description: "Frequently Asked Questions about Patshell Trading.",
}

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I know the parts are genuine?",
      answer: "All parts sold on Patshell Trading are thoroughly vetted. Our verified sellers must provide accurate descriptions and, where applicable, part numbers and condition reports."
    },
    {
      question: "What happens if a part doesn't fit my vehicle?",
      answer: "We highly recommend checking the exact part number and vehicle compatibility before purchasing. If a part was incorrectly described by the seller, you are covered under our Returns Policy."
    },
    {
      question: "How do I sell my old parts?",
      answer: "Simply create an account, go to your dashboard, and click 'Sell Scrap' or 'Add Product'. You can upload photos, set a price, and start selling to thousands of buyers nationwide."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit cards, debit cards, and secure online payment gateways through our encrypted checkout system."
    },
    {
      question: "How long does shipping take?",
      answer: "Shipping times vary depending on the seller's location and the shipping method chosen at checkout. Most domestic orders arrive within 3-7 business days."
    }
  ]

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted">Everything you need to know about buying and selling on Patshell.</p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-bold text-ink">{faq.question}</h3>
            <p className="mt-2 text-muted">{faq.answer}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 rounded-2xl bg-surface-alt p-8 text-center">
        <h3 className="text-xl font-bold text-ink">Still have questions?</h3>
        <p className="mt-2 text-muted">We&apos;re here to help. Reach out to our support team.</p>
        <a href="mailto:support@patshell.com" className="mt-4 inline-block font-semibold text-primary hover:underline">
          support@patshell.com
        </a>
      </div>
    </div>
  )
}
