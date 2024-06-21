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

const { log, logError, logSuccess } = logger('Composable Functions')

const getProduct = cf.trace((result) => {
  if (!result.success) log('📦 Product not found')
})(cf.composable(findProductById))

const getVariants = cf.composable(findVariantsByProductId)

const getCoupon = cf.trace((result) => {
  if (!result.success) log('🏷️ Coupon not found')
})(cf.composable(findCoupon))

const getProductPageDataBeforeDiscount = cf.collect({
  product: getProduct,
  variants: getVariants,
  coupon: cf.catchFailure(getCoupon, () => blankCoupon),
})

const getProductPageData = cf.applySchema(paramsSchema)(
  cf.map(getProductPageDataBeforeDiscount, ({ variants, coupon, product }) => ({
    product,
    coupon,
    variants: applyDiscountToVariants({ variants, discount: coupon.discount }),
  })),
)

const program = cf.pipe(cf.composable(getArgs), getProductPageData)

async function main() {
  const result = await program()

  result.success
    ? logSuccess(result.data)
    : logError(cf.serialize(result).errors)
}

await main()
