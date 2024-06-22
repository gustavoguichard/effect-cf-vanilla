import * as e from './errors'

/**
 * This function will log messages to the console with the program name so we can easily identify where the log is coming from when running all programs in parallel.
 */
const makeLogger = (name: string) => {
  const prefix = `\n====== ${name}: `
  return {
    log: (message: string) => console.log(`${prefix}${message}`),
    error: (error: unknown) => {
      if (error instanceof e.ProductNotFoundError) {
        console.error(`${prefix}📦 Product not found`)
      }
      if (error instanceof e.VariantsNotFoundError) {
        console.error(`${prefix}↔️ Variants not found`)
      }
      if (error instanceof e.CouponNotFoundError) {
        console.error(`${prefix}🏷️ Coupon not found`)
      }
    },
    exit: (result: unknown) => {
      console.log(`${prefix}✅✅✅✅ Result:
  ${JSON.stringify(result, null, 2)})
  ====== ✅✅✅✅\n`)
    },
    fail: (result: unknown) => {
      console.error(`${prefix}❌❌❌❌ Result:
${JSON.stringify(result, null, 2)}
====== ❌❌❌❌\n`)
    },
  }
}

export { makeLogger }
