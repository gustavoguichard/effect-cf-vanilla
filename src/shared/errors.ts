/**
 * Some custom errors thrown by the application
 * We are using _tag to please the Effect library
 */

class ProductNotFoundError extends Error {
  readonly _tag = 'ProductNotFoundError'
}

class VariantsNotFoundError extends Error {
  readonly _tag = 'VariantsNotFoundError'
}

class CouponNotFoundError extends Error {
  readonly _tag = 'CouponNotFoundError'
}

export { CouponNotFoundError, ProductNotFoundError, VariantsNotFoundError }
