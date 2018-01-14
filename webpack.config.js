const debug = process.env.NODE_ENV !== 'production'
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: __dirname,
  watch: !!debug,
  devtool: debug ? 'inline-sourcemap' : null,
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(js|jsx|babel)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
}
