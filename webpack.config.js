const path = require('path')
const dotenv = require('dotenv')
const CopyPlugin = require('copy-webpack-plugin')
const JsonPostProcessPlugin = require('json-post-process-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const packageJSON = require('./package.json')

dotenv.config()

/**
 * @param {string} str
 */
const pluginSource = (str) => path.join(__dirname, `src/plugin/${str}`)

/**
 * @param {string} str
 */
const pluginDist = (str) => path.join(__dirname, `dist/plugin/${str}`)

module.exports = {
  mode: process.env.MODE,
  devtool: 'inline-source-map',
  entry: {
    contentScript: pluginSource`contentScript.ts`,
    backgroundScript: pluginSource`backgroundScript.ts`,
  },
  output: {
    path: pluginDist``,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new JsonPostProcessPlugin({
      matchers: [
        {
          matcher: /manifest\.json$/,
          action: (currentJSON) => ({
            ...currentJSON,
            version: packageJSON.version,
            name:
              currentJSON.name +
              (process.env.NODE_ENV === 'production' ? '' : ' dev'),
            browser_action: {
              ...currentJSON.browser_action,
              default_title:
                currentJSON.browser_action.default_title +
                (process.env.NODE_ENV === 'production' ? '' : ' dev'),
            },
          }),
        },
      ],
    }),
    new CopyPlugin({
      patterns: [
        // Load UI created by vite
        { from: pluginDist``, to: pluginDist`` },

        { from: pluginSource`public`, to: pluginDist`` },
        {
          from: pluginSource`user_interface/assets/icon`,
          to: pluginDist`assets/icon`,
        },
      ],
      options: {},
    }),
    new ZipPlugin({
      path: path.join(__dirname, 'dist'),
      filename: `${packageJSON.name}-${packageJSON.version}.zip`,
    }),
  ],
}
