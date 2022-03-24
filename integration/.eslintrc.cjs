module.exports = {
  extends: ['../.eslintrc.cjs'],
  globals: {
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true,
    testTimeout: 20000,
  },
};
