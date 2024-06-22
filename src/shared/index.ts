/**
 * Get the arguments from the command line through Bun and convert them into the expected input shape of the program.
 */
const getArgs = () => ({
  productId: Bun.argv[2],
  couponCode: Bun.argv[3],
})

export { getArgs }
export * from './logger'
