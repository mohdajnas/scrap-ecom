import { NextResponse } from 'next/server'
import { verifySuperAdmin, logAdminAction } from '@/lib/admin-utils'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendListingApprovedEmail } from '@/lib/emails'
import { adminApproveSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const { isAuthorized, user } = await verifySuperAdmin()
    if (!isAuthorized || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const parseResult = adminApproveSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 400 })
    }

    const { productId } = parseResult.data

    const adminClient = createAdminClient()

    const { data: product, error } = await adminClient
      .from('products')
      .update({ status: 'approved', rejection_reason: null })
      .eq('id', productId)
      .select('title, profiles:seller_id(email)')
      .single()

    if (error) throw error

    await logAdminAction(user.id, 'approve_listing', 'products', productId)

    const sellerEmail = (product.profiles as any)?.email
    if (sellerEmail) {
      await sendListingApprovedEmail(sellerEmail, product.title)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Approve Listing Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
