import { z } from "zod"

// ------------------------------------------------------------------
// Checkout & Payments
// ------------------------------------------------------------------

export const createOrderSchema = z.object({
  shipping_address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    postal_code: z.string().min(4),
    country: z.string().default('India')
  })
})

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(10),
  razorpay_payment_id: z.string().min(10),
  razorpay_signature: z.string().min(32)
})

// ------------------------------------------------------------------
// Reviews
// ------------------------------------------------------------------

export const submitReviewSchema = z.object({
  product_id: z.string().uuid(),
  order_item_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
})

// ------------------------------------------------------------------
// Admin Actions
// ------------------------------------------------------------------

export const adminApproveSchema = z.object({
  productId: z.string().uuid()
})

export const adminRejectSchema = z.object({
  productId: z.string().uuid(),
  reason: z.string().min(5).max(500)
})

export const adminBanUserSchema = z.object({
  targetUserId: z.string().uuid(),
  banStatus: z.boolean()
})

export const adminRefundOrderSchema = z.object({
  orderId: z.string().uuid()
})

export const adminCreateCategorySchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  description: z.string().min(10),
  image_url: z.string().url().optional()
})
