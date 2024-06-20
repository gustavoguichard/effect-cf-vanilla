import { CouponNotFoundError, ProductNotFoundError } from './shared/errors'
import {
  paramsSchema,
  type Coupon,
  type Params,
  type Variant,
} from './shared/types'
import { findProductFromDB, getArgs, logger } from './shared/utils'

const log = logger('Vanilla')

const getProduct = findProductFromDB

const getVariants = async ({ productId }: Pick<Params, 'productId'>) => {
  if (productId !== '123') {
    throw new ProductNotFoundError('Product not found')
  }
  // This would come from your database
  return [
    { productId, sku: 'small', name: 'Small', price: 8.99 },
    { productId, sku: 'medium', name: 'Medium', price: 10.99 },
    { productId, sku: 'large', name: 'Large', price: 12.99 },
  ] as Variant[]
}

const getCoupon = async ({ couponCode }: Pick<Params, 'couponCode'>) => {
  if (couponCode !== '10OFF') {
    throw new CouponNotFoundError('Coupon not found')
  }
  // This would come from your database
  return { code: couponCode, discount: 10 } as Coupon
}

const getProductPageDataBeforeDiscount = async (params: Params) => {
  const [product, variants, coupon] = await Promise.all([
    getProduct(params),
    getVariants(params),
    getCoupon(params),
  ])
  return { product, variants, coupon }
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

async function getProductPageData(params: Params) {
  const { product, variants, coupon } = await getProductPageDataBeforeDiscount(
    params,
  )
  return {
    product,
    coupon,
    variants: applyDiscountToVariants({ variants, discount: coupon.discount }),
  }
}

async function main() {
  try {
    const params = getArgs()
    const parsedParams = paramsSchema.parse(params)
    const result = await getProductPageData(parsedParams)
    log.logResult(result)
  } catch (error) {
    log.logError(error)
  }
}

await main()
