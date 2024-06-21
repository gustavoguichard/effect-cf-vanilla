import { Effect, Either, pipe } from 'effect'
import { UnknownException } from 'effect/Cause'
import { ProductNotFoundError } from './shared/errors'
import {
  applyDiscountToVariants,
  blankCoupon,
  findCoupon,
  findProductById,
  findVariantsByProductId,
} from './shared/model'
import { paramsSchema, type Params } from './shared/types'
import { getArgs, logger } from './shared/utils'

const { log, logError, logSuccess } = logger('Effect')

const getProduct = (...params: Parameters<typeof findProductById>) =>
  Effect.tryPromise({
    try: () => findProductById(...params),
    catch: (error) => {
      log('📦 Product not found')
      return error instanceof ProductNotFoundError
        ? error
        : new UnknownException('Product not found')
    },
  })

const getVariants = (...params: Parameters<typeof findVariantsByProductId>) =>
  Effect.tryPromise({
    try: () => findVariantsByProductId(...params),
    catch: (error) =>
      error instanceof ProductNotFoundError
        ? error
        : new UnknownException('Variants not found'),
  })

const getCoupon = (...params: Parameters<typeof findCoupon>) =>
  Effect.flatMap(
    Effect.either(Effect.tryPromise(() => findCoupon(...params))),
    (e) =>
      Either.isLeft(e) ? Effect.succeed(blankCoupon) : Effect.succeed(e.right),
  )

const getProductPageDataBeforeDiscount = (params: Params) =>
  Effect.all({
    product: getProduct(params),
    variants: getVariants(params),
    coupon: getCoupon(params),
  })

const program = pipe(
  Effect.try(getArgs),
  Effect.map(paramsSchema.parse),
  Effect.flatMap(getProductPageDataBeforeDiscount),
  Effect.map(({ product, coupon, variants }) => ({
    product,
    variants: applyDiscountToVariants({
      variants,
      discount: coupon.discount,
    }),
    coupon,
  })),
)

const main = Effect.match(program, {
  onFailure: (error) => logError(error),
  onSuccess: (data) => logSuccess(data),
})

await Effect.runPromise(main)
