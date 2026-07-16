import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitReviewSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parseResult = submitReviewSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid review payload', details: parseResult.error.flatten() }, { status: 400 })
    }

    const { product_id, order_item_id, rating, comment } = parseResult.data

    // Insert the review. The RLS policy will automatically reject it if the 
    // user doesn't own the order item or if the order isn't 'delivered'.
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        reviewer_id: user.id,
        order_item_id,
        rating,
        comment
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You have already reviewed this item' }, { status: 400 })
      }
      console.error(error)
      // Generic error if RLS fails (e.g. order not delivered)
      return NextResponse.json({ error: 'Cannot submit review. Ensure the order is delivered and belongs to you.' }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err: any) {
    console.error('Submit Review Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
