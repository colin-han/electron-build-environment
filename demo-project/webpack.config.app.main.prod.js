/**
 * Webpack config for production electron main process
 */

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import BabiliPlugin from 'babili-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from './internals/scripts/CheckNodeEnv';

import pkg from './package.json';

CheckNodeEnv('production');

let defaultExt = baseConfig.resolve.extensions;
if (process.env.NODE_ENV === 'production') {
  defaultExt = ['.app.prod.js', '.app.prod.jsx', '.app.js', ...defaultExt];
} else {
  defaultExt = ['.app.dev.js', '.app.dev.jsx', '.app.js', ...defaultExt];
}

export default merge.smart(baseConfig, {
  devtool: 'source-map',

  target: 'electron-main',

  entry: './app/main',

  externals: pkg.app && pkg.app.externalDependencies,

  // 'main.js' in root
  output: {
    path: path.resolve(__dirname, 'dist/app'),
    filename: 'main.prod.js'
  },

  resolve: {
    extensions: defaultExt,
  },

  plugins: [
    /**
     * Babli is an ES6+ aware minifier based on the Babel toolchain (beta)
     */
    new BabiliPlugin(),

    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.RUN_TIME': JSON.stringify('ELECTRON')
    })
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  },
});
