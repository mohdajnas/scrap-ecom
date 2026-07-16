export const metadata = {
  title: "Returns Policy | Patshell Trading",
  description: "Returns and refund policy for Patshell Trading.",
}

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">Returns Policy</h1>
        <p className="mt-4 text-lg text-muted">Last updated: July 2026</p>
      </div>

      <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-ink prose-p:text-muted prose-li:text-muted">
        <h2>1. Return Window</h2>
        <p>
          We want you to be completely satisfied with your purchase. Buyers have <strong>14 days</strong> from the date of delivery to initiate a return request for eligible items.
        </p>

        <h2>2. Eligible Items for Return</h2>
        <p>
          To be eligible for a return, the part must be:
        </p>
        <ul>
          <li>In the exact same condition that you received it.</li>
          <li>Uninstalled and unaltered.</li>
          <li>In its original packaging (if applicable).</li>
        </ul>
        <p>
          Items sold &quot;As-Is&quot; or explicitly marked as non-returnable by the seller cannot be returned unless they significantly differ from the listing description.
        </p>

        <h2>3. How to Initiate a Return</h2>
        <p>
          To start a return:
        </p>
        <ol>
          <li>Log in to your account and go to your Order History.</li>
          <li>Select the order and click &quot;Request Return.&quot;</li>
          <li>Provide a detailed reason for the return and attach photos if the item is damaged or not as described.</li>
        </ol>

        <h2>4. Return Shipping</h2>
        <p>
          If the return is due to a seller error (e.g., wrong part sent, defective item not disclosed), the seller is responsible for return shipping costs. If the return is due to buyer remorse or an incorrect part ordered by mistake, the buyer is responsible for return shipping costs.
        </p>

        <h2>5. Refunds</h2>
        <p>
          Once the seller receives and inspects the returned item, a refund will be processed to the original method of payment within 3-5 business days. Original shipping fees are generally non-refundable unless the return is due to a seller error.
        </p>
      </div>
    </div>
  )
}
