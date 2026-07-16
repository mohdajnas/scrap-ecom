import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { razorpay } from '@/lib/razorpay'
import { createOrderSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parseResult = createOrderSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid shipping address data', details: parseResult.error.flatten() }, { status: 400 })
    }

    const { shipping_address } = parseResult.data

    // Re-fetch cart items directly from the server
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        product_id,
        products ( price, stock_qty, title )
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

    // Create the order in Supabase first (status='created')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: totalAmount,
        status: 'created',
        shipping_address: shipping_address
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error(orderError)
      return NextResponse.json({ error: 'Failed to create order record' }, { status: 500 })
    }

    // Call Razorpay API to create the exact order amount in paise
    const amountInPaise = Math.round(totalAmount * 100)
    
    const rpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.id, // Link Razorpay receipt to our Supabase order ID
    })

    if (!rpOrder || !rpOrder.id) {
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 })
    }

    // Update the Supabase order with the razorpay_order_id
    const { error: updateError } = await supabase
      .from('orders')
      .update({ razorpay_order_id: rpOrder.id })
      .eq('id', order.id)

    if (updateError) {
      console.error(updateError)
      return NextResponse.json({ error: 'Failed to link Razorpay order' }, { status: 500 })
    }

    // Return the required Razorpay checkout details
    return NextResponse.json({
      razorpay_order_id: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    })

  } catch (err: any) {
    console.error('Create Order Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
