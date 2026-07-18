import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createOrderSchema } from '@/lib/validators'
import { paymentGateway } from '@/lib/payment-gateway'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const parseResult = createOrderSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid shipping address data', details: parseResult.error.flatten() }, { status: 400 })
    }

    const { shipping_address, payment_method } = parseResult.data

    // Re-fetch cart items directly from the server
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        product_id,
        products ( price, stock_qty, title, seller_id )
      `)
      .eq('user_id', user.id)

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty or failed to load' }, { status: 400 })
    }

    // Validate stock and compute total server-side
    let totalAmount = 0
    for (const item of cartItems) {
      const product = item.products as any
      if (item.quantity > product.stock_qty) {
        return NextResponse.json({ 
          error: `Not enough stock for ${product.title}. Only ${product.stock_qty} left.` 
        }, { status: 400 })
      }
      totalAmount += product.price * item.quantity
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 })
    }
    
    // Generate unique Tracking ID and Client Reference ID
    const trackingId = `TRK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    const clientReferenceId = `ORD-${Date.now()}-${crypto.randomUUID().split('-')[0]}`

    // Create the order in Supabase first (status='created' or 'placed' if COD)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: totalAmount,
        status: payment_method === 'cod' ? 'placed' : 'created',
        shipping_address: shipping_address,
        razorpay_order_id: payment_method === 'cod' ? `COD-${trackingId}` : null,
        tracking_id: trackingId
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error(orderError)
      return NextResponse.json({ error: 'Failed to create order record' }, { status: 500 })
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (payment_method === 'cod') {
      // Map and insert order items with status and seller_id
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        seller_id: (item.products as any).seller_id,
        title_snapshot: (item.products as any).title,
        price_snapshot: (item.products as any).price,
        quantity: item.quantity,
        price_at_time: (item.products as any).price,
        status: 'placed'
      }))

      const { error: itemsError } = await adminClient.from('order_items').insert(orderItems)
      if (itemsError) {
        console.error('Failed to insert order items:', itemsError)
        return NextResponse.json({ error: 'Failed to save order items' }, { status: 500 })
      }

      // Deduct stock for each product
      for (const item of cartItems) {
        const product = item.products as any
        await adminClient
          .from('products')
          .update({ stock_qty: Math.max(0, product.stock_qty - item.quantity) })
          .eq('id', item.product_id)
      }

      // Clear the cart for COD orders
      await adminClient.from('cart_items').delete().eq('user_id', user.id)
      
      return NextResponse.json({
        redirectUrl: `${origin}/checkout/success?ref=${trackingId}`
      })
    }

    // Initiate payment with custom gateway (Placeholder)
    const paymentResponse = await paymentGateway.initiatePayment({
      clientReferenceId: clientReferenceId,
      amount: totalAmount,
      customerName: profile?.full_name || 'Customer',
      customerEmail: user.email || 'guest@example.com',
      customerPhone: '+919999999999', // Placeholder as it's not collected during checkout in this demo
      redirectUrl: `${origin}/checkout/verify?ref=${clientReferenceId}`
    })

    if (paymentResponse.status !== 'SUCCESS') {
      console.error('Payment initiation failed:', paymentResponse)
      return NextResponse.json({ error: 'Failed to initiate payment gateway' }, { status: 500 })
    }

    // Update the Supabase order with the internal reference ID returned by gateway
    const { error: updateError } = await supabase
      .from('orders')
      .update({ razorpay_order_id: paymentResponse.data.internalReferenceId })
      .eq('id', order.id)

    if (updateError) {
      console.error(updateError)
      return NextResponse.json({ error: 'Failed to link payment order' }, { status: 500 })
    }

    // Return the required gateway checkout details
    // We can return the redirectUrl for option A, or qrCode for option B. Let's return both and decide on the frontend.
    return NextResponse.json({
      internalReferenceId: paymentResponse.data.internalReferenceId,
      qrCode: paymentResponse.data.qrCode,
      redirectUrl: paymentResponse.data.redirectUrl
    })

  } catch (err: any) {
    console.error('Create Order Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
