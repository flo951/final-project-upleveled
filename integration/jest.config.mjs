const config = {
  preset: 'jest-puppeteer',
  maxWorkers: 2,
};
module.exports = {
  // ...
  testTimeout: 20000,
};
export default config;
