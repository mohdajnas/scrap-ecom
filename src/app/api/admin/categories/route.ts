import { NextResponse } from 'next/server'
import { verifySuperAdmin, logAdminAction } from '@/lib/admin-utils'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { isAuthorized, user } = await verifySuperAdmin()
    if (!isAuthorized || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { slug, title, description, image_url } = await request.json()
    if (!slug || !title || !description) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const adminClient = createAdminClient()
    const { data, error } = await adminClient.from('categories').insert({ slug, title, description, image_url }).select('id').single()

    if (error) throw error
    await logAdminAction(user.id, 'create_category', 'categories', data.id)

    return NextResponse.json({ success: true, id: data.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { isAuthorized, user } = await verifySuperAdmin()
    if (!isAuthorized || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing category id' }, { status: 400 })

    const adminClient = createAdminClient()
    const { error } = await adminClient.from('categories').delete().eq('id', id)

    if (error) throw error
    await logAdminAction(user.id, 'delete_category', 'categories', id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
