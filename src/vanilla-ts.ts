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
const logger = makeLogger('Vanilla')

async function getProductPageData(params: Params) {
  // Collect the data from the different sources in parallel
  const [product, variants, coupon] = await Promise.all([
    findProductById(params),
    findVariantsByProductId(params),
    // Ensure we always return a coupon
    findCoupon(params).catch(() => blankCoupon),
  ])

  return {
    product,
    coupon,
    // Apply the discount to the variants
    variants: applyDiscountToVariants({ variants, discount: coupon.discount }),
  }
}

async function program() {
  try {
    // Get the arguments from the terminal
    const params = getArgs()
    // Ensure the data at runtime
    const parsedParams = paramsSchema.parse(params)
    // Use the arguments as input to the program
    const data = await getProductPageData(parsedParams)
    // Check if the program succeeded or not
    return { success: true, data }
  } catch (error) {
    // Log custom errors
    logger.error(error)
    return { success: false, error }
  }
}

// Run the program and log the result depending on success/failure
async function main() {
  const result = await program()

  result.success ? logger.exit(result.data) : logger.fail(result.error)
}

await main()
