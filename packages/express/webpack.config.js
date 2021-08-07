/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../../webpack.base.config.js');

module.exports = {
  ...baseConfig,
  entry: './src/index.ts',
};
