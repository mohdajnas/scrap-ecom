import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedAdmin() {
  const email = process.argv[2]
  const password = process.argv[3]
  const fullName = process.argv[4] || 'Super Admin'

  if (!email || !password) {
    console.error("Usage: ts-node scripts/seed-admin.ts <email> <password> [full_name]")
    process.exit(1)
  }

  console.log(`Creating super admin: ${email}...`)

  // 1. Create the user
  const { data: userResponse, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  })

  if (createError) {
    console.error("Failed to create user:", createError.message)
    process.exit(1)
  }

  const userId = userResponse.user.id
  console.log("User created with ID:", userId)

  // 2. Wait a moment for the handle_new_user trigger to fire and insert the profile
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 3. Update the profile role to super_admin
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('id', userId)

  if (updateError) {
    console.error("Failed to update role:", updateError.message)
    process.exit(1)
  }

  console.log("Successfully seeded Super Admin!")
}

seedAdmin().catch(console.error)
