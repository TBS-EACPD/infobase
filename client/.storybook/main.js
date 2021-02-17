const std_lib_path = require("path");
const webpack = require("@storybook/react/node_modules/webpack");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
  ],
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    config.resolve = {
      ...config.resolve,
      modules: [std_lib_path.resolve(__dirname, "../"), "node_modules/"],
    };
    config.plugins.push(
      new webpack.DefinePlugin({
        APPLICATION_LANGUAGE: JSON.stringify("en"),
      })
    );
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        { loader: "style-loader" }, // creates style nodes from JS strings
        { loader: "css-loader" }, // translates CSS into CommonJS
        {
          // compiles Sass to CSS
          loader: "sass-loader",
          options: {
            sassOptions: {
              fiber: false,
            },
          },
        },
      ],
      sideEffects: true,
    });
    config.module.rules.push({
      test: /\.yaml$/,
      exclude: /node_modules/, // custom loader, make sure not to hit node_modules with it
      use: [
        { loader: "json-loader" },
        {
          loader: "./node_loaders/yaml-lang-loader.js",
          options: { lang: "en" },
        },
      ],
    });
    config.module.rules.push({
      test: /\.csv$/,
      use: [{ loader: "raw-loader", options: { esModule: false } }],
    });

    return config;
  },
};
