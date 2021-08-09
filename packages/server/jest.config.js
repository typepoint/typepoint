// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.config.json');

module.exports = {
  ...baseConfig,
  coveragePathIgnorePatterns: [
    ...(baseConfig.coveragePathIgnorePatterns || []),
    '.*/fixtures.ts',
  ],
};
