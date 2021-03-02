const std_lib_path = require("path");
const webpack = require("@storybook/react/node_modules/webpack");

const { get_rules } = require("../build_code/webpack_common.js");
const {
  bundle_extended_bootstrap_css,
} = require("../build_code/bundle_extended_bootstrap_css.js");

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

    // TODO hacky, this is essentially to set injected_build_constants.js's lang export.
    // Going to have components that need other injected build constants though, and might
    // even want some that have stories for different sets of build constants (a11y vs standard mode, etc.)
    // so we need a less hacky and more exstensible way to mock these constants (in general + case by case?)
    config.plugins.push(
      new webpack.DefinePlugin({
        APPLICATION_LANGUAGE: JSON.stringify("en"),
      })
    );

    // As in the real client, the extended bootstrap stylesheet is precompiled and loaded by the initial html file
    // (see prieview-head.html) rather than part of the app bundles themselves. This hook ensures the extended bootstrap
    // stylesheet is updated* and exists where the storybook index.html expects it
    // * small caveat, unlike normal builds nothing is watching the extended bootstrap files themselves, only output when
    // something changes in a file the storybook webpack IS watching
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.emit.tap("EmitPlugin", () =>
          bundle_extended_bootstrap_css(config.output.path)
        );
      },
    });

    config.module.rules = [
      ...config.module.rules,
      ...get_rules({
        language: "en",
        is_prod_build: false,
        target_ie11: true,
      }),
    ];

    return config;
  },
};
