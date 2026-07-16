import { NextResponse } from 'next/server'
import { verifySuperAdmin, logAdminAction } from '@/lib/admin-utils'
import { createAdminClient } from '@/lib/supabase/admin'
import { razorpay } from '@/lib/razorpay'
import { adminRefundOrderSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const { isAuthorized, user } = await verifySuperAdmin()
    if (!isAuthorized || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const parseResult = adminRefundOrderSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 400 })
    }

    const { orderId } = parseResult.data

    const adminClient = createAdminClient()

    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, razorpay_payment_id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Order must be paid to issue a refund' }, { status: 400 })
    }

    if (!order.razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing Razorpay payment ID' }, { status: 400 })
    }

    // 1. Issue refund via Razorpay API
    const refundResponse = await razorpay.payments.refund(order.razorpay_payment_id, {
      "speed": "normal" // defaults to full amount
    })

    if (!refundResponse || !refundResponse.id) {
      throw new Error("Failed to process refund with Razorpay")
    }

    // 2. Update order status
    const { error: updateError } = await adminClient
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', order.id)

    if (updateError) throw updateError

    await logAdminAction(user.id, 'refund_order', 'orders', order.id)

    return NextResponse.json({ success: true, refundId: refundResponse.id })
  } catch (err: any) {
    console.error('Refund Order Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
