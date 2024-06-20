import {
  applySchema,
  collect,
  composable,
  map,
  pipe,
  sequence,
  serialize,
} from 'composable-functions'
import { CouponNotFoundError, ProductNotFoundError } from './shared/errors'
import {
  paramsSchema,
  type Coupon,
  type Params,
  type Variant,
} from './shared/types'
import { findProductFromDB, getArgs, logger } from './shared/utils'

const log = logger('Composable Functions')

const getProduct = composable(findProductFromDB)

const getVariants = composable(({ productId }: Pick<Params, 'productId'>) => {
  if (productId !== '123') {
    throw new ProductNotFoundError('Product not found')
  }
  // This would come from your database
  return [
    { productId, sku: 'small', name: 'Small', price: 8.99 },
    { productId, sku: 'medium', name: 'Medium', price: 10.99 },
    { productId, sku: 'large', name: 'Large', price: 12.99 },
  ] as Variant[]
})

const getCoupon = composable(({ couponCode }: Pick<Params, 'couponCode'>) => {
  if (couponCode !== '10OFF') {
    throw new CouponNotFoundError('Coupon not found')
  }
  // This would come from your database
  return { code: couponCode, discount: 10 } as Coupon
})

const getProductPageDataBeforeDiscount = collect({
  product: getProduct,
  variants: getVariants,
  coupon: getCoupon,
})

const applyDiscountToVariants = composable(
  ({
    variants,
    discount,
  }: {
    variants: Variant[]
    discount: number
  }): Array<Variant & { priceWithDiscount: number }> =>
    variants.map((variant) => ({
      ...variant,
      priceWithDiscount: variant.price * (1 - discount / 100),
    })),
)

const getProductPageData = applySchema(paramsSchema)(
  map(
    sequence(
      map(getProductPageDataBeforeDiscount, (data) => ({
        ...data,
        discount: data.coupon.discount,
      })),
      applyDiscountToVariants,
    ),
    ([{ product, coupon }, variants]) => ({ product, coupon, variants }),
  ),
)

async function main() {
  const result = await pipe(composable(getArgs), getProductPageData)()

  result.success
    ? log.logResult(result.data)
    : log.logError(serialize(result).errors)
}

await main()
