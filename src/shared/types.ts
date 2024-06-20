import * as z from 'zod'

const paramsSchema = z.object({ productId: z.string(), couponCode: z.string() })

type Params = z.infer<typeof paramsSchema>

type Product = {
  id: string
  name: string
}

type Coupon = {
  code: string
  discount: number
}

type Variant = {
  productId: string
  sku: string
  name: string
  price: number
}

export { paramsSchema }
export type { Coupon, Params, Product, Variant }
