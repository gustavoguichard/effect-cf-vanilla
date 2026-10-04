import { Effect } from 'effect'
import { getArgs, makeLogger } from './shared'
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

// Wrap a function that might throw or reject so the error goes to the error channel
const attempt = <A>(thunk: () => A | Promise<A>) =>
  Effect.tryPromise({ try: async () => thunk(), catch: (error) => error })

// Collect the data from the different sources in parallel
const getProductPageDataBeforeDiscount = (params: Params) =>
  Effect.all(
    {
      product: attempt(() => findProductById(params)),
      variants: attempt(() => findVariantsByProductId(params)),
      // Ensure we always return a coupon
      coupon: Effect.orElseSucceed(
        attempt(() => findCoupon(params)),
        () => blankCoupon,
      ),
    },
    { concurrency: 'unbounded' },
  )

const program = attempt(() =>
  // Get the arguments from the terminal and check them at runtime
  paramsSchema.parse(getArgs()),
).pipe(
  // Use the arguments as input to the program
  Effect.flatMap(getProductPageDataBeforeDiscount),
  Effect.flatMap(({ product, coupon, variants }) =>
    attempt(() => ({
      product,
      coupon,
      // Apply the discount to the variants
      variants: applyDiscountToVariants({
        variants,
        discount: coupon.discount,
      }),
    })),
  ),
  // Log custom errors
  Effect.tapError((error) => Effect.sync(() => logger.error(error))),
)

// Log the result depending on success/failure
const main = Effect.match(program, {
  onFailure: (error) => logger.fail(error),
  onSuccess: (data) => logger.exit(data),
})

// Run the program
await Effect.runPromise(main)
