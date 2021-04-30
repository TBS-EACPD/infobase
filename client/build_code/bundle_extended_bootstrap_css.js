import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import FilterChunkWebpackPlugin from "filter-chunk-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";

export function bundle_extended_bootstrap_css(output_path) {
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
