export const metadata = {
  title: "Privacy Policy | Patshell Trading",
  description: "Privacy policy outlining how Patshell Trading handles your data.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-lg text-muted">Last updated: July 2026</p>
      </div>

      <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-ink prose-p:text-muted prose-li:text-muted">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information to provide better services to our users. This includes:
        </p>
        <ul>
          <li><strong>Personal Information:</strong> Name, email address, phone number, and billing/shipping addresses provided during registration and checkout.</li>
          <li><strong>Transaction Data:</strong> Details about payments and purchases made through our platform.</li>
          <li><strong>Usage Data:</strong> Information about how you interact with our website, including IP addresses, browser types, and pages visited.</li>
        </ul>

        <h2>2. How We Use Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Provide, maintain, and improve our marketplace services.</li>
          <li>Process transactions and send related information (e.g., confirmations, receipts).</li>
          <li>Communicate with you regarding updates, security alerts, and support messages.</li>
          <li>Monitor and analyze trends, usage, and activities to enhance user experience.</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
        </ul>

        <h2>3. Sharing of Information</h2>
        <p>
          We do not sell your personal information. We may share information in the following circumstances:
        </p>
        <ul>
          <li><strong>With Sellers/Buyers:</strong> Necessary details (like shipping addresses) are shared between buyers and sellers to facilitate transactions.</li>
          <li><strong>With Service Providers:</strong> We share data with third-party vendors who perform services on our behalf (e.g., payment processing, email delivery).</li>
          <li><strong>For Legal Reasons:</strong> If required by law, regulation, or legal process, or to protect the rights, property, and safety of Patshell Trading, our users, or the public.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2>5. Your Choices</h2>
        <p>
          You can access, update, or delete your account information at any time through your dashboard profile settings. You may also opt out of receiving promotional communications by following the unsubscribe instructions in those emails.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions or concerns about our Privacy Policy or data practices, please contact us at <a href="mailto:privacy@patshell.com" className="text-primary hover:underline">privacy@patshell.com</a>.
        </p>
      </div>
    </div>
  )
}
