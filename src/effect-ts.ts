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

// Create a custom logger for this program
const { log, logError, logSuccess } = logger('Effect')

// Wrap the findProductById function with a try/catch to log when the product is not found
const getProduct = (...params: Parameters<typeof findProductById>) =>
  Effect.tryPromise({
    try: () => findProductById(...params),
    catch: (error) => {
      log('📦 Product not found')
      // We lost the type information here, so we need to check the error type again
      return error instanceof ProductNotFoundError
        ? error
        : new UnknownException('Product not found')
    },
  })

// Wrap the findVariantsByProductId function
const getVariants = (...params: Parameters<typeof findVariantsByProductId>) =>
  Effect.tryPromise({
    try: () => findVariantsByProductId(...params),
    // We lost the type information here, so we need to check the error type again
    catch: (error) =>
      error instanceof ProductNotFoundError
        ? error
        : new UnknownException('Variants not found'),
  })

// Wrap the findCoupon function, log the error, and ensure we always return a coupon
const getCoupon = (...params: Parameters<typeof findCoupon>) =>
  Effect.flatMap(
    Effect.either(Effect.tryPromise(() => findCoupon(...params))),
    (e) => {
      // In case of an error we log the error and return a blank coupon
      if (Either.isLeft(e)) {
        log('🏷️ Coupon not found')
        return Effect.succeed(blankCoupon)
      }
      return Effect.succeed(e.right)
    },
  )

// Collect the data from the different sources in parallel
const getProductPageDataBeforeDiscount = (params: Params) =>
  Effect.all({
    product: getProduct(params),
    variants: getVariants(params),
    coupon: getCoupon(params),
  })

const program = pipe(
  // Get the arguments from the terminal
  Effect.try(getArgs),
  // Check the arguments at runtime
  // If this breaks, the program halts
  Effect.map(paramsSchema.parse),
  // Use the arguments as input to the program
  Effect.flatMap(getProductPageDataBeforeDiscount),

  Effect.map(({ product, coupon, variants }) => ({
    product,
    coupon,
    // Apply the discount to the variants
    variants: applyDiscountToVariants({ variants, discount: coupon.discount }),
  })),
)

// Log the result depending on success/failure
const main = Effect.match(program, {
  onFailure: (error) => logError(error),
  onSuccess: (data) => logSuccess(data),
})

// Run the program
await Effect.runPromise(main)
