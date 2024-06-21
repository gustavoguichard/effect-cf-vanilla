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
const { log, logError, logSuccess } = logger('Vanilla')

// Wrap the findCoupon function, log the error, and ensure we always return a coupon
async function getCoupon(...params: Parameters<typeof findCoupon>) {
  try {
    return await findCoupon(...params)
  } catch (error) {
    log('🏷️ Coupon not found')
    return blankCoupon
  }
}

async function getProductPageData(params: Params) {
  // Collect the data from the different sources in parallel
  const [product, variants, coupon] = await Promise.all([
    findProductById(params),
    findVariantsByProductId(params),
    getCoupon(params),
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
    // Log the product not found error depending on the error type
    if (error instanceof ProductNotFoundError) {
      log('📦 Product not found')
    }
    return { success: false, error }
  }
}

// Run the program and log the result depending on success/failure
async function main() {
  const result = await program()

  result.success ? logSuccess(result.data) : logError(result.error)
}

await main()
