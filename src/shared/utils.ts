/**
 * This function will log messages to the console with the program name so we can easily identify where the log is coming from when running all programs in parallel.
 */
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

/**
 * Get the arguments from the command line through Bun and convert them into the expected input shape of the program.
 */
const getArgs = () => ({
  productId: Bun.argv[2],
  couponCode: Bun.argv[3],
})

export { getArgs, logger }
