import { Effect, Either, pipe } from 'effect'
import { UnknownException } from 'effect/Cause'
import { getArgs, makeLogger } from './shared'
import { ProductNotFoundError, VariantsNotFoundError } from './shared/errors'
import {
  applyDiscountToVariants,
  blankCoupon,
  findCoupon,
  findProductById,
  findVariantsByProductId,
} from './shared/business-logic'
import { paramsSchema, type Params } from './shared/types'

// Create a custom logger for this program
const logger = makeLogger('Effect')

// Wrap the findProductById function with a try/catch to log when the product is not found
const getProduct = (...params: Parameters<typeof findProductById>) =>
  Effect.tryPromise({
    try: () => findProductById(...params),
    catch: (error) => {
      // We lost the type information here, so we need to check the error type again
      return error instanceof ProductNotFoundError
        ? error
        : new UnknownException('Unexpected error')
    },
  })

// Wrap the findVariantsByProductId function
const getVariants = (...params: Parameters<typeof findVariantsByProductId>) =>
  Effect.tryPromise({
    try: () => findVariantsByProductId(...params),
    // We lost the type information here, so we need to check the error type again
    catch: (error) =>
      error instanceof VariantsNotFoundError
        ? error
        : new UnknownException('Unexpected error'),
  })

// Wrap the findCoupon function and ensure we always return a coupon
const getCoupon = (...params: Parameters<typeof findCoupon>) =>
  Effect.flatMap(
    Effect.either(Effect.tryPromise(() => findCoupon(...params))),
    (e) =>
      // Ensure we always return a coupon
      Either.isLeft(e) ? Effect.succeed(blankCoupon) : Effect.succeed(e.right),
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
  Effect.flatMap((args) => Effect.try(() => paramsSchema.parse(args))),
  // Use the arguments as input to the program
  Effect.flatMap(getProductPageDataBeforeDiscount),
  Effect.map(({ product, coupon, variants }) => ({
    product,
    coupon,
    // Apply the discount to the variants
    variants: applyDiscountToVariants({ variants, discount: coupon.discount }),
  })),
  // Log custom errors
  Effect.catchTag('ProductNotFoundError', (error) => {
    logger.error(error)
    return Effect.fail(error)
  }),
  Effect.catchTag('VariantsNotFoundError', (error) => {
    logger.error(error)
    return Effect.fail(error)
  }),
)

// Log the result depending on success/failure
const main = Effect.match(program, {
  onFailure: (error) => logger.fail(error),
  onSuccess: (data) => logger.exit(data),
})

// Run the program
await Effect.runPromise(main)
