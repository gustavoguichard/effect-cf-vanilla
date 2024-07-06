import { describe, expect, test } from 'bun:test'
import {
  CouponNotFoundError,
  ProductNotFoundError,
  VariantsNotFoundError,
} from './errors'
import * as subject from './business-logic'

describe('findProductById', async () => {
  test('returns a product when found', async () => {
    const product = await subject.findProductById({ productId: '123' })
    expect(product).toEqual({ id: '123', name: 'Magical T-Shirt' })
  })

  test('throws a ProductNotFoundError otherwise', () => {
    const promise = subject.findProductById({ productId: '456' })
    return expect(promise).rejects.toThrow(ProductNotFoundError)
  })
})

describe('findVariantsByProductId', async () => {
  test('returns variants when found', async () => {
    const variants = await subject.findVariantsByProductId({ productId: '123' })
    expect(variants).toEqual([
      { productId: '123', sku: 'small', name: 'Small', price: 8.99 },
      { productId: '123', sku: 'medium', name: 'Medium', price: 10.99 },
      { productId: '123', sku: 'large', name: 'Large', price: 12.99 },
    ])
  })

  test('throws a VariantsNotFoundError otherwise', () => {
    const promise = subject.findVariantsByProductId({ productId: '456' })
    return expect(promise).rejects.toThrow(VariantsNotFoundError)
  })
})

describe('findCoupon', async () => {
  test('returns a coupon when found', async () => {
    const coupon = await subject.findCoupon({ couponCode: '10OFF' })
    expect(coupon).toEqual({ code: '10OFF', discount: 10 })
  })

  test('throws a CouponNotFoundError otherwise', () => {
    const promise = subject.findCoupon({ couponCode: '20OFF' })
    return expect(promise).rejects.toThrow(CouponNotFoundError)
  })
})

describe('applyDiscountToVariants', () => {
  const variants = [
    { productId: '123', sku: 'small', name: 'Small', price: 8.99 },
    { productId: '123', sku: 'medium', name: 'Medium', price: 10.99 },
    { productId: '123', sku: 'large', name: 'Large', price: 12.99 },
  ]

  test('applies a discount to all variants', () => {
    const result = subject.applyDiscountToVariants({ variants, discount: 10 })
    expect(result).toEqual([
      {
        productId: '123',
        sku: 'small',
        name: 'Small',
        price: 8.99,
        priceWithDiscount: 8.09,
      },
      {
        productId: '123',
        sku: 'medium',
        name: 'Medium',
        price: 10.99,
        priceWithDiscount: 9.89,
      },
      {
        productId: '123',
        sku: 'large',
        name: 'Large',
        price: 12.99,
        priceWithDiscount: 11.69,
      },
    ])
  })
})
