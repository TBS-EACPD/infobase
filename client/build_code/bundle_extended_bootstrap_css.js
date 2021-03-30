/* eslint-disable no-console */
const webpack = require("webpack");

function bundle_extended_bootstrap_css(output_path) {
  const MiniCssExtractPlugin = require("mini-css-extract-plugin");
  const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
  const FilterChunkWebpackPlugin = require("filter-chunk-webpack-plugin");

  const config = {
    name: "container page css bundle",
    mode: "production",
    entry: [
      "./src/extended_bootstrap_css/extended_bootstrap_index.side-effects.js",
    ],
    output: {
      path: output_path,
    },
    optimization: {
      minimize: true,
      minimizer: [new CssMinimizerPlugin({ parallel: true })],
      sideEffects: false,
    },
    module: {
      rules: [
        {
          test: /\.css$|\.scss$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: "extended-bootstrap.css" }),
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      new FilterChunkWebpackPlugin({ patterns: ["*.js"] }),
    ],
  };

  webpack(config, function (err, stats) {
    console.log(stats.toString({ cached: true, modules: true }));
    if (err || stats.hasErrors()) {
      process.exitCode = 1;
    }
  });
}

module.exports = exports = { bundle_extended_bootstrap_css };
