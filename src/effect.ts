import { Effect, pipe } from 'effect'
import { CouponNotFoundError, ProductNotFoundError } from './shared/errors'
import {
  paramsSchema,
  type Coupon,
  type Params,
  type Variant,
} from './shared/types'
import { findProductFromDB, getArgs, logger } from './shared/utils'

const log = logger('Effect')

const getProduct = (params: Params) =>
  Effect.tryPromise(() => findProductFromDB(params))

const getVariants = ({
  productId,
}: Pick<Params, 'productId'>): Effect.Effect<
  Array<Variant>,
  ProductNotFoundError,
  never
> => {
  if (productId !== '123') {
    return Effect.fail(new ProductNotFoundError('Product not found'))
  }
  // This would come from your database
  return Effect.succeed([
    { productId, sku: 'small', name: 'Small', price: 8.99 },
    { productId, sku: 'medium', name: 'Medium', price: 10.99 },
    { productId, sku: 'large', name: 'Large', price: 12.99 },
  ])
}

const getCoupon = ({
  couponCode,
}: Pick<Params, 'couponCode'>): Effect.Effect<
  Coupon,
  CouponNotFoundError,
  never
> => {
  if (couponCode !== '10OFF') {
    return Effect.fail(new CouponNotFoundError('Coupon not found'))
  }
  // This would come from your database
  return Effect.succeed({ code: couponCode, discount: 10 })
}

const getProductPageDataBeforeDiscount = (params: Params) =>
  Effect.all({
    product: getProduct(params),
    variants: getVariants(params),
    coupon: getCoupon(params),
  })

const applyDiscountToVariants = ({
  variants,
  discount,
}: {
  variants: Array<Variant>
  discount: number
}): Effect.Effect<
  Array<Variant & { priceWithDiscount: number }>,
  Error,
  never
> =>
  discount === 0
    ? Effect.fail(new Error('Discount cannot be zeo'))
    : Effect.succeed(
        variants.map((variant) => ({
          ...variant,
          priceWithDiscount: variant.price * (1 - discount / 100),
        })),
      )

const getProductPageData = () =>
  pipe(
    Effect.try(getArgs),
    Effect.map(paramsSchema.parse),
    Effect.flatMap(getProductPageDataBeforeDiscount),
    Effect.flatMap(({ product, variants, coupon }) =>
      Effect.all([
        Effect.succeed({ product, coupon }),
        applyDiscountToVariants({
          variants,
          discount: coupon.discount,
        }),
      ]),
    ),
    Effect.map(([{ product, coupon }, variants]) => ({
      product,
      variants,
      coupon,
    })),
  )

async function main() {
  const result = await Effect.runPromiseExit(getProductPageData())

  result._tag === 'Failure'
    ? log.logError(result.cause)
    : log.logResult(result.value)
}

await main()
