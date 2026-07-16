import { NextResponse } from 'next/server'
import { verifySuperAdmin, logAdminAction } from '@/lib/admin-utils'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendListingRejectedEmail } from '@/lib/emails'
import { adminRejectSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const { isAuthorized, user } = await verifySuperAdmin()
    if (!isAuthorized || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const parseResult = adminRejectSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 400 })
    }

    const { productId, reason } = parseResult.data

    const adminClient = createAdminClient()

    const { data: product, error } = await adminClient
      .from('products')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', productId)
      .select('title, profiles:seller_id(email)')
      .single()

    if (error) throw error

    await logAdminAction(user.id, 'reject_listing', 'products', productId)

    const sellerEmail = (product.profiles as any)?.email
    if (sellerEmail) {
      await sendListingRejectedEmail(sellerEmail, product.title, reason)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Reject Listing Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
