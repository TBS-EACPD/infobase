/* eslint-disable no-console */
const webpack = require('webpack');
const path = require('path');

const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FilterChunkWebpackPlugin = require('filter-chunk-webpack-plugin');


const config = {
  name: 'container page css bundle',
  mode: 'production',
  entry: ['./src/bootstrapped_css/bootstrapped_css.js'],
  output: {
    path: path.resolve(__dirname, '../build/InfoBase/app/'),
  },
  optimization: {
    minimizer: [ 
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }), 
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$|\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/, // Temporary, throw out all bootstrap3 glyphicons, won't need in bootstrap4
        loader: 'null-loader',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'container-page.css' }),
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    new FilterChunkWebpackPlugin({ patterns: ['*.js'] }),
  ],
};

webpack(config, function(err,stats){
  console.log(stats.toString({cached:true,modules:true}));
  if( err || stats.hasErrors() ){ process.exitCode = 1; } 
});