import { NextResponse } from 'next/server'
import { verifySuperAdmin, logAdminAction } from '@/lib/admin-utils'
import { createAdminClient } from '@/lib/supabase/admin'
import { adminBanUserSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const { isAuthorized, user } = await verifySuperAdmin()
    if (!isAuthorized || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const parseResult = adminBanUserSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 400 })
    }

    const { targetUserId, banStatus } = parseResult.data

    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('profiles')
      .update({ is_banned: banStatus })
      .eq('id', targetUserId)

    if (error) throw error

    await logAdminAction(user.id, banStatus ? 'ban_user' : 'unban_user', 'profiles', targetUserId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Ban User Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
