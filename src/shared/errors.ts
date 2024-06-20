class ProductNotFoundError extends Error {
  readonly _tag = 'ProductNotFoundError'
  constructor(message: string) {
    super(message)
    this.name = 'ProductNotFoundError'
  }
}

class CouponNotFoundError extends Error {
  readonly _tag = 'CouponNotFoundError'
  constructor(message: string) {
    super(message)
    this.name = 'CouponNotFoundError'
  }
}

export { CouponNotFoundError, ProductNotFoundError }
