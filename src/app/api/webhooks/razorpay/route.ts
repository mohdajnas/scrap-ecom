import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmedEmail } from '@/lib/emails'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
    }

    // 1. Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8')
    const receivedBuffer = Buffer.from(signature, 'utf-8')

    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      console.warn('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const adminClient = createAdminClient()

    // 2. Idempotency Check (Insert into payment_events)
    // If this fails due to UNIQUE constraint on razorpay_event_id, we've already processed it
    const { error: insertError } = await adminClient
      .from('payment_events')
      .insert({
        razorpay_event_id: event.id,
        event_type: event.event,
        payload: event
      })

    if (insertError && insertError.code === '23505') {
      return NextResponse.json({ message: 'Event already processed' }, { status: 200 })
    }

    // 3. Handle Event
    const paymentEntity = event.payload.payment.entity
    const razorpayOrderId = paymentEntity.order_id
    
    // Find our order
    const { data: order } = await adminClient
      .from('orders')
      .select('id, status, buyer_id, total_amount, profiles:buyer_id(email)')
      .eq('razorpay_order_id', razorpayOrderId)
      .single()

    if (!order) {
      console.warn(`Order not found for razorpay_order_id: ${razorpayOrderId}`)
      return NextResponse.json({ message: 'Order not found, ignoring' }, { status: 200 })
    }

    if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
      if (order.status !== 'paid') {
        // Fallback: If the user closed their browser and step 3 never ran, 
        // this webhook guarantees the order is marked paid.
        await adminClient
          .from('orders')
          .update({
            status: 'paid',
            razorpay_payment_id: paymentEntity.id
          })
          .eq('id', order.id)
          
        const buyerEmail = (order.profiles as any)?.email
        if (buyerEmail) {
          await sendOrderConfirmedEmail(buyerEmail, order.id, order.total_amount)
        }
      }
    } else if (event.event === 'payment.failed') {
      if (order.status !== 'paid' && order.status !== 'cancelled') {
        await adminClient
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', order.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Webhook Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
