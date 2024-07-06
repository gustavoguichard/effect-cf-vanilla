import * as cf from 'composable-functions'
import { getArgs, makeLogger } from './shared'
import {
  applyDiscountToVariants,
  blankCoupon,
  findCoupon,
  findProductById,
  findVariantsByProductId,
} from './shared/business-logic'
import { paramsSchema } from './shared/types'

// Create a custom logger for this program
const logger = makeLogger('Composable Functions')

// Collect the data from the different sources in parallel
const getProductPageDataBeforeDiscount = cf.collect({
  product: findProductById,
  variants: findVariantsByProductId,
  // Ensure we always return a coupon
  coupon: cf.catchFailure(findCoupon, () => blankCoupon),
})

// applySchema will ensure the data at runtime
const getProductPageData = cf.applySchema(paramsSchema)(
  cf.map(getProductPageDataBeforeDiscount, ({ variants, coupon, product }) => ({
    product,
    coupon,
    // Apply the discount to the variants
    variants: applyDiscountToVariants({ variants, discount: coupon.discount }),
  })),
)

// Log custom errors
const traceErrors = cf.trace((result) => result.errors.forEach(logger.error))

// Get the arguments from the terminal and use as input to the program
const program = traceErrors(cf.pipe(getArgs, getProductPageData))

// Run the program and log the result depending on success/failure
async function main() {
  const result = await program()

  result.success ? logger.exit(result.data) : logger.fail(cf.serialize(result))
}

await main()
