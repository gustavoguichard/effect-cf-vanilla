import { ProductNotFoundError } from './errors'
import type { Product } from './types'

function logError(result: unknown, name: string): void {
  console.error(`\n====== ❌❌❌❌ ${name} Result:
${JSON.stringify(result, null, 2)}
====== ❌❌❌❌\n`)
}

function logResult(result: unknown, name: string): void {
  console.log(`\n====== ✅✅✅✅ ${name} Result:
${JSON.stringify(result, null, 2)})
====== ✅✅✅✅\n`)
}

const logger = (name: string) => ({
  logError: (result: unknown) => logError(result, name),
  logResult: (result: unknown) => logResult(result, name),
})

const findProductFromDB = async ({ productId }: { productId: string }) => {
  // This would come from your database
  if (productId !== '123') {
    throw new ProductNotFoundError('Product not found')
  }
  const product: Product = { id: productId, name: 'Magical T-Shirt' }
  return product
}

const getArgs = () => ({
  productId: Bun.argv[2],
  couponCode: Bun.argv[3],
})

export { findProductFromDB, getArgs, logger }
