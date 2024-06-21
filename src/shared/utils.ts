const logger = (name: string) => ({
  log: (message: string) => console.log(`\n====== ${name}: ${message}`),
  // Final error log:
  logError: (result: unknown) =>
    console.error(`\n====== ❌❌❌❌ ${name} Result:
${JSON.stringify(result, null, 2)}
====== ❌❌❌❌\n`),
  // Final success log:
  logSuccess: (result: unknown) =>
    console.log(`\n====== ✅✅✅✅ ${name} Result:
${JSON.stringify(result, null, 2)})
====== ✅✅✅✅\n`),
})

const getArgs = () => ({
  productId: Bun.argv[2],
  couponCode: Bun.argv[3],
})

export { getArgs, logger }
