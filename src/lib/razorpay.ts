import Razorpay from "razorpay"

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id_for_build',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret_for_build',
})
