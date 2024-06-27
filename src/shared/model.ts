import {
  CouponNotFoundError,
  ProductNotFoundError,
  VariantsNotFoundError,
} from './errors'
import type { Coupon, Product, Variant } from './types'

const blankCoupon: Coupon = { code: '', discount: 0 }

/**
 * Simulates a database call to find a product by its ID
 */
const findProductById = async ({
  productId,
}: {
  productId: string
}): Promise<Product> => {
  if (productId !== '123') {
    throw new ProductNotFoundError()
  }
  return { id: productId, name: 'Magical T-Shirt' }
}

/**
 * Simulates a database call to find all variants for a product
 */
const findVariantsByProductId = async ({
  productId,
}: {
  productId: string
}): Promise<Array<Variant>> => {
  if (productId !== '123') {
    throw new VariantsNotFoundError()
  }
  // This would come from your database
  return [
    { productId, sku: 'small', name: 'Small', price: 8.99 },
    { productId, sku: 'medium', name: 'Medium', price: 10.99 },
    { productId, sku: 'large', name: 'Large', price: 12.99 },
  ]
}

/**
 * Simulates a database call to find a coupon by its code
 */
const findCoupon = async ({
  couponCode,
}: {
  couponCode: string
}): Promise<Coupon> => {
  if (couponCode !== '10OFF') {
    throw new CouponNotFoundError()
  }
  // This would come from your database
  return { code: couponCode, discount: 10 }
}

/**
 * A function that applies a discount to an array of variants
 */
function applyDiscountToVariants({
  variants,
  discount,
}: {
  variants: Variant[]
  discount: number
}): Array<Variant & { priceWithDiscount: number }> {
  return variants.map((variant) => ({
    ...variant,
    priceWithDiscount: Number(
      (variant.price * (1 - discount / 100)).toFixed(2),
    ),
  }))
}

export {
  applyDiscountToVariants,
  blankCoupon,
  findCoupon,
  findProductById,
  findVariantsByProductId,
}
