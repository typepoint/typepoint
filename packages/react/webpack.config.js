// eslint-disable-next-line @typescript-eslint/no-var-requires
const getWebpackConfig = require('../../webpack.base.config');

module.exports = getWebpackConfig(__dirname, {
  entry: './src/index.tsx',
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
});
