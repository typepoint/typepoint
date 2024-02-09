// eslint-disable-next-line @typescript-eslint/no-var-requires, import/extensions
const baseConfig = require('../../webpack.base.config.js');

module.exports = {
  ...baseConfig,
  entry: './src/index.ts',
};
