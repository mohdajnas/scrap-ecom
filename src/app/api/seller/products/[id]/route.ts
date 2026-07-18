import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
    }

    // Since RLS is enabled, the user can only delete their own product anyway.
    // But let's be explicit and verify the seller_id.
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('seller_id', user.id) // Extra safety

    if (deleteError) {
      if (deleteError.code === '23503') {
        // Soft delete: hide it from store (stock=0) and seller dashboard (rejection_reason='deleted_by_seller')
        const { createClient: createAdminClient } = await import('@supabase/supabase-js')
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const { error: softDeleteError } = await adminClient
          .from('products')
          .update({ stock_qty: 0, rejection_reason: 'deleted_by_seller' })
          .eq('id', id)
        
        if (softDeleteError) {
          console.error('Failed to soft delete:', softDeleteError)
          return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
        }
        return NextResponse.json({ success: true, softDeleted: true })
      }
      console.error('Failed to delete product:', deleteError)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Delete product error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
