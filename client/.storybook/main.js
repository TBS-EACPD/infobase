const std_lib_path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    config.resolve = {
      ...config.resolve,
      modules: [std_lib_path.resolve(__dirname, "../"), "node_modules/"],
    };
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

    return config;
  },
};
