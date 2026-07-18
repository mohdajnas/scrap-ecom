import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { paymentGateway } from '@/lib/payment-gateway'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // 1. Verify Signature
    if (!paymentGateway.verifyWebhookSignature(payload)) {
      console.warn('Webhook signature verification failed:', payload)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { data } = payload
    
    // We only care if payment is successfully completed
    if (data.transactionStatus !== 'Approved' && data.transactionStatus !== 'LateApproved') {
      return NextResponse.json({ status: 'Ignored, not approved' }, { status: 200 })
    }

    const adminClient = createAdminClient()

    // 2. Retrieve order using gateway client reference ID
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, total_amount, status, buyer_id')
      .eq('gateway_client_reference_id', data.clientReferenceId)
      .single()

    if (orderError || !order) {
      console.error('Webhook: Order not found for reference', data.clientReferenceId)
      // Return 200 anyway so gateway doesn't retry infinitely on a bad reference
      return NextResponse.json({ error: 'Order not found' }, { status: 200 })
    }
    
    if (order.status === 'paid') {
      return NextResponse.json({ message: 'Order already processed' }, { status: 200 })
    }

    // 3. Verify exactly matching amount
    // The webhook payload's requestedAmount must match our DB total_amount exactly
    if (parseFloat(data.requestedAmount) !== order.total_amount) {
      console.warn(`Webhook amount mismatch for order ${order.id}: expected ${order.total_amount}, got ${data.requestedAmount}`)
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
    }

    // 4. Update database (Orders, Cart Items, Products) securely via Admin Client
    
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
      
      // Decrement stock gracefully
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
      
      // Clear cart
      await adminClient.from('cart_items').delete().eq('user_id', order.buyer_id)
    }

    // Finally mark order as paid
    await adminClient
      .from('orders')
      .update({
        status: 'paid'
      })
      .eq('id', order.id)

    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 })
  } catch (err: any) {
    console.error('Webhook Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
