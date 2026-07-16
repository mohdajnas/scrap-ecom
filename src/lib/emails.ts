import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null
const FROM_EMAIL = 'Patshell Trading <no-reply@patshell.com>'

export async function sendOrderConfirmedEmail(email: string, orderId: string, amount: number) {
  if (!resend) {
    console.log(`[Email Simulation] Order Confirmed for ${email}: Order ${orderId}, Amount ₹${amount}`)
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Order Confirmed #${orderId}`,
    html: `<p>Thank you for your purchase!</p><p>Your order #${orderId} for ₹${amount} has been successfully placed.</p>`
  })
}

export async function sendListingApprovedEmail(email: string, productTitle: string) {
  if (!resend) {
    console.log(`[Email Simulation] Listing Approved for ${email}: ${productTitle}`)
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Listing Approved: ${productTitle}`,
    html: `<p>Great news! Your listing "<strong>${productTitle}</strong>" has been approved and is now live on Patshell Trading.</p>`
  })
}

export async function sendListingRejectedEmail(email: string, productTitle: string, reason: string) {
  if (!resend) {
    console.log(`[Email Simulation] Listing Rejected for ${email}: ${productTitle} (Reason: ${reason})`)
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Listing Action Required: ${productTitle}`,
    html: `<p>Unfortunately, your listing "<strong>${productTitle}</strong>" was not approved.</p><p>Reason: ${reason}</p>`
  })
}

export async function sendOrderShippedEmail(email: string, orderId: string) {
  if (!resend) {
    console.log(`[Email Simulation] Order Shipped for ${email}: Order ${orderId}`)
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your Order #${orderId} Has Shipped!`,
    html: `<p>Your order #${orderId} is on its way.</p>`
  })
}
