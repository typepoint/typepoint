// eslint-disable-next-line @typescript-eslint/no-var-requires, import/extensions
const getWebpackConfig = require('../../webpack.base.config.js');

module.exports = getWebpackConfig(__dirname, {
  entry: './src/index.ts',
  externals: {
    axios: 'axios',
  },
});
