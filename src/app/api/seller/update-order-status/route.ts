import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, status } = body

    if (!itemId || !status) {
      return NextResponse.json({ error: 'Missing itemId or status' }, { status: 400 })
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify that the seller owns the product inside this order item
    const { data: orderItem, error: fetchError } = await adminClient
      .from('order_items')
      .select('*, products(seller_id)')
      .eq('id', itemId)
      .single()

    if (fetchError || !orderItem) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 })
    }

    const product = orderItem.products as any
    if (product.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own items' }, { status: 403 })
    }

    // Update the status
    const { error: updateError } = await adminClient
      .from('order_items')
      .update({ status })
      .eq('id', itemId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Update status error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
