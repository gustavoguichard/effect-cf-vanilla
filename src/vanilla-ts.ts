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

const { log, logError, logSuccess } = logger('Vanilla')

const getProductPageDataBeforeDiscount = async (params: Params) => {
  const [product, variants] = await Promise.all([
    findProductById(params),
    findVariantsByProductId(params),
  ])
  let coupon = blankCoupon
  try {
    coupon = await findCoupon(params)
  } catch (error) {
    log('🏷️ Coupon not found')
  }
  return { product, variants, coupon }
}

async function getProductPageData(params: Params) {
  const { product, variants, coupon } = await getProductPageDataBeforeDiscount(
    params,
  )
  return {
    product,
    coupon,
    variants: applyDiscountToVariants({ variants, discount: coupon.discount }),
  }
}

async function program() {
  try {
    const params = getArgs()
    const parsedParams = paramsSchema.parse(params)
    const data = await getProductPageData(parsedParams)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      log('📦 Product not found')
    }
    return { success: false, error }
  }
}

async function main() {
  const result = await program()

  result.success ? logSuccess(result.data) : logError(result.error)
}

await main()
