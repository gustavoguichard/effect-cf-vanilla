import { CouponNotFoundError, ProductNotFoundError } from './errors'
import type { Coupon, Product, Variant } from './types'

const blankCoupon: Coupon = { code: '', discount: 0 }

const findProductById = async ({
  productId,
}: {
  productId: string
}): Promise<Product> => {
  // This would come from your database
  if (productId !== '123') {
    throw new ProductNotFoundError('Product not found')
  }
  return { id: productId, name: 'Magical T-Shirt' }
}

const findVariantsByProductId = async ({
  productId,
}: {
  productId: string
}): Promise<Array<Variant>> => {
  if (productId !== '123') {
    throw new ProductNotFoundError('Product not found')
  }
  // This would come from your database
  return [
    { productId, sku: 'small', name: 'Small', price: 8.99 },
    { productId, sku: 'medium', name: 'Medium', price: 10.99 },
    { productId, sku: 'large', name: 'Large', price: 12.99 },
  ]
}

const findCoupon = async ({
  couponCode,
}: {
  couponCode: string
}): Promise<Coupon> => {
  if (couponCode !== '10OFF') {
    throw new CouponNotFoundError('Coupon not found')
  }
  // This would come from your database
  return { code: couponCode, discount: 10 }
}

function applyDiscountToVariants({
  variants,
  discount,
}: {
  variants: Variant[]
  discount: number
}): Array<Variant & { priceWithDiscount: number }> {
  return variants.map((variant) => ({
    ...variant,
    priceWithDiscount: variant.price * (1 - discount / 100),
  }))
}

export {
  applyDiscountToVariants,
  blankCoupon,
  findCoupon,
  findProductById,
  findVariantsByProductId,
}
