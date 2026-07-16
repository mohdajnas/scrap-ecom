import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { razorpay } from '@/lib/razorpay'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { verifyPaymentSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parseResult = verifyPaymentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payment payload', details: parseResult.error.flatten() }, { status: 400 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parseResult.data

    const secret = process.env.RAZORPAY_KEY_SECRET!
    
    // 1. Recompute HMAC-SHA256 signature
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    // Constant-time compare
    const expectedBuffer = Buffer.from(generatedSignature, 'utf-8')
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf-8')
    
    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      console.warn(`Signature mismatch for order ${razorpay_order_id}`)
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // 2. Admin client to bypass RLS for subsequent secure updates
    const adminClient = createAdminClient()

    // Retrieve order
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, total_amount, status, buyer_id')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    if (order.status === 'paid') {
      return NextResponse.json({ message: 'Order already processed' }, { status: 200 })
    }

    // 3. Verify exactly matching amount via Razorpay API to prevent amount tampering
    const payment = await razorpay.payments.fetch(razorpay_payment_id)
    if (payment.amount !== Math.round(order.total_amount * 100)) {
      console.warn(`Amount mismatch for order ${order.id}: expected ${order.total_amount * 100}, got ${payment.amount}`)
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
    }
    
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    }

    // 4. Update database (Orders, Cart Items, Products) securely via Admin Client
    // We should do this in a single transaction ideally, but Supabase standard API doesn't 
    // natively support multi-table transactions without an RPC. We will do it sequentially safely.
    
    // Fetch cart items to snapshot
    const { data: cartItems } = await adminClient
      .from('cart_items')
      .select('product_id, quantity, products(price, title, seller_id)')
      .eq('user_id', order.buyer_id)

    if (cartItems && cartItems.length > 0) {
      const orderItems = cartItems.map(item => {
        const prod = item.products as any
        return {
          order_id: order.id,
          product_id: item.product_id,
          price_at_time: prod.price,
          quantity: item.quantity,
        }
      })
      
      // Insert order items
      await adminClient.from('order_items').insert(orderItems)
      
      // Decrement stock gracefully via individual updates (or a stored RPC)
      // Since we don't have an RPC handy, we'll iterate
      for (const item of cartItems) {
        const { data: currentProd } = await adminClient
          .from('products')
          .select('stock_qty')
          .eq('id', item.product_id)
          .single()
          
        if (currentProd && currentProd.stock_qty >= item.quantity) {
          await adminClient
            .from('products')
            .update({ stock_qty: currentProd.stock_qty - item.quantity })
            .eq('id', item.product_id)
        }
      }
      
      if (payment.status === 'captured') {
        await adminClient.from('cart_items').delete().eq('user_id', order.buyer_id)
      }
    }

    // Finally mark order as paid
    await adminClient
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq('id', order.id)

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err: any) {
    console.error('Verify Payment Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
