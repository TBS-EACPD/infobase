const std_lib_path = require("path");
const webpack = require("@storybook/react/node_modules/webpack");

const { get_rules } = require("../build_code/webpack_common.js");
const {
  bundle_extended_bootstrap_css,
} = require("../build_code/bundle_extended_bootstrap_css.js");

const LANG = "en";

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
  ],
  webpackFinal: async (config) => ({
    ...config,

    module: {
      ...config.module,
      // fully override default storybook rules with the client's rules
      rules: get_rules({
        language: LANG,
        is_prod_build: false,
        target_ie11: true,
      }),
    },

    resolve: {
      ...config.resolve,
      modules: [std_lib_path.resolve(__dirname, "../"), "node_modules/"],
    },

    plugins: [
      ...config.plugins,
      new webpack.DefinePlugin({
        // TODO hacky, this is essentially to set injected_build_constants.js's lang export.
        // Going to have components that need other injected build constants though, and might
        // even want some that have stories for different sets of build constants (a11y vs standard mode, etc.)
        // so we need a less hacky and more exstensible way to mock these constants (in general + case by case?)
        APPLICATION_LANGUAGE: JSON.stringify(LANG),
        IS_A11Y_MODE: process.env.STORYBOOK_A11Y,
      }),
      {
        // As in the real client, the extended bootstrap stylesheet is precompiled and loaded by the initial html file
        // (see prieview-head.html) rather than part of the app bundles themselves. This hook ensures the extended bootstrap
        // stylesheet is updated* and exists where the storybook index.html expects it
        // * small caveat, unlike normal builds nothing is watching the extended bootstrap files themselves, only output when
        // something changes in a files the storybook webpack IS watching
        apply: (compiler) => {
          compiler.hooks.emit.tap("EmitPlugin", () =>
            bundle_extended_bootstrap_css(config.output.path)
          );
        },
      },
    ],
  }),
};
