import { z } from "zod"

export const sellScrapSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long").max(1000),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  condition: z.enum(["new", "used", "refurbished"], {
    message: "Please select the part's condition.",
  }),
  category_id: z.string().uuid("Please select a valid category"),
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  stock_qty: z.coerce.number().int().min(1, "Stock must be at least 1").default(1),
})

export type SellScrapInput = z.infer<typeof sellScrapSchema>
