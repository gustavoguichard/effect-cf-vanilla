import * as cf from 'composable-functions'
import {
  applyDiscountToVariants,
  blankCoupon,
  findCoupon,
  findProductById,
  findVariantsByProductId,
} from './shared/model'
import { paramsSchema } from './shared/types'
import { getArgs, logger } from './shared/utils'

// Create a custom logger for this program
const { log, logError, logSuccess } = logger('Composable Functions')

// Wrap the findProductById function with a trace function to log when the product is not found
const getProduct = cf.trace((result) => {
  if (!result.success) log('📦 Product not found')
})(cf.composable(findProductById))

// Wrap the findVariantsByProductId function
const getVariants = cf.composable(findVariantsByProductId)

// Wrap the findCoupon function, log the error, and ensure we always return a coupon
const getCoupon = cf.catchFailure(cf.composable(findCoupon), () => {
  log('🏷️ Coupon not found')
  return blankCoupon
})

// Collect the data from the different sources in parallel
const getProductPageDataBeforeDiscount = cf.collect({
  product: getProduct,
  variants: getVariants,
  coupon: getCoupon,
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

// Get the arguments from the terminal and use as input to the program
const program = cf.pipe(cf.composable(getArgs), getProductPageData)

// Run the program and log the result depending on success/failure
async function main() {
  const result = await program()

  result.success
    ? logSuccess(result.data)
    : logError(cf.serialize(result).errors)
}

await main()
