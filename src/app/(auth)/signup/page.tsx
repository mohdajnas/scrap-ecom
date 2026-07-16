"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupInput } from "@/lib/validators/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const handleFormSubmit = async (data: SignupInput) => {
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName, // Stored in raw_user_meta_data for the trigger
          },
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Account created! Please check your email to verify.")
        router.push("/login")
      }
    } catch (err) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-soft">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-ink">Create an account</h1>
        <p className="mt-2 text-sm text-muted">Join Patshell Trading today</p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Full Name</label>
          <input
            {...register("fullName")}
            type="text"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="John Doe"
          />
          {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Min 10 chars, 1 letter, 1 number"
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <span className="mx-4 text-xs text-muted uppercase">Or</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
        Sign up with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
