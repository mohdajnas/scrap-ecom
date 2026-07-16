import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { User, Mail, Shield, Calendar } from "lucide-react"

export const revalidate = 0

export default async function ProfilePage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch the user's profile from the public.profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const fullName = profile?.full_name || "Unknown User"
  const role = profile?.role || "buyer"
  const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
          My Profile
        </h1>
        <p className="mt-2 text-muted">Manage your personal information and account settings</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Avatar & Quick Info */}
        <div className="col-span-1 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-ink">{fullName}</h2>
            <p className="mt-1 text-sm text-muted capitalize">{role}</p>
          </div>
          
          <div className="mt-8 space-y-4 border-t border-border pt-6">
            <div className="flex items-center gap-3 text-sm text-muted">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Shield className="h-4 w-4" />
              <span className="capitalize">{role} Account</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Calendar className="h-4 w-4" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Details */}
        <div className="col-span-1 space-y-6 md:col-span-2">
          {/* Personal Information Form */}
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-ink">Personal Information</h2>
            
            <form className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Full Name</label>
                <input
                  type="text"
                  disabled
                  defaultValue={fullName}
                  className="rounded-lg border border-input bg-surface-alt px-4 py-2 text-sm text-muted opacity-80"
                />
                <p className="text-xs text-muted">Your name is synchronized with your profile.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Email Address</label>
                <input
                  type="email"
                  disabled
                  defaultValue={user.email}
                  className="rounded-lg border border-input bg-surface-alt px-4 py-2 text-sm text-muted opacity-80"
                />
                <p className="text-xs text-muted">Your email address cannot be changed.</p>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="rounded-3xl border border-danger/20 bg-danger/5 p-8">
            <h2 className="mb-2 text-xl font-bold text-danger">Account Actions</h2>
            <p className="mb-6 text-sm text-muted">
              Sign out of your account to end your current session.
            </p>
            
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-danger px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
