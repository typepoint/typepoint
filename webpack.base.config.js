/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const getWebpackConfig = (projectPath, overrides) => ({
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: [/node_modules/, /\.test\.tsx?$/],
        options: {
          configFile: 'tsconfig.main.json',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(projectPath, 'dist'),
    library: {
      type: 'commonjs',
    },
  },
  ...overrides,
});

module.exports = getWebpackConfig;
