// const config = {
//   testEnvironment: 'jsdom',
//   testPathIgnorePatterns: ['<rootDir/integration'],
// };

// export default config;
const config = {
  preset: 'jest-puppeteer',
  maxWorkers: 2,
};

export default config;
