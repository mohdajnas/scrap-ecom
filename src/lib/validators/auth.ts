import { z } from "zod"

export const passwordSchema = z
  .string()
  .min(10, { message: "Password must be at least 10 characters long" })
  .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordSchema,
})

export type SignupInput = z.infer<typeof signupSchema>
