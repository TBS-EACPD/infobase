const webpack = require('webpack')
// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

const lang = "en";


const path = require('path');

const module_defn =  {
  rules: [
    // add your custom rules.
    {
      rules: [
        {
          test: /^((?!\.exec).)*\.js$/, 
          exclude: /node_modules|external-dependencies/, //es2015 loader adds 'use strict' everywhere, which breaks scripts from external-dependencies/
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                presets: ['react'],
              },
            },
            {
              loader: 'eslint-loader',
            },
          ],
        },
        {
          test: /\.exec\.js$/,
          use: ['script-loader'],
        },
        {
          test: /\.ib.yaml$/, //consider having webpack create a split bundle for the result.
          use: [
            { loader: "./node_loaders/ib-text-loader.js" },
            { loader: "json-loader" },
            { 
              loader: "./node_loaders/yaml-lang-loader.js",
              options: {lang},
            },
          ],
        }, 
        {
          test: /^((?!\.ib).)*\.yaml$/, //consider having webpack create a split bundle for the result.
          use: [
            { loader: "json-loader" },
            { 
              loader: "./node_loaders/yaml-lang-loader.js",
              options: {lang},
            },
          ],
        },
        {
          test:/\.css$/,
          use: [
            { loader: "style-loader" },
            { 
              loader: "css-loader",
              options: { 
                url: false,
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            { loader: "style-loader" }, // creates style nodes from JS strings }, 
            { loader: "css-loader" }, // translates CSS into CommonJS
            { loader: "sass-loader"}, // compiles Sass to CSS 
          ],
        },
        { 
          test: /\.csv$/,
          use: [ { loader: 'raw-loader' } ],
        },
      ],

    },
  ],
};

const plugins = [
  new webpack.DefinePlugin({
    APPLICATION_LANGUAGE : JSON.stringify(lang),
    IB_PLUS : false,
    DEV: true,
    PRE_PUBLIC_ACCOUNTS: false,
    TEST: false,
  }),
];

// Export a function. Accept the base config as the only param.
module.exports = (storybookBaseConfig, configType) => {
  // configType has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  // Make whatever fine-grained changes you need
  return Object.assign({}, storybookBaseConfig, {
    module: module_defn,
    plugins: storybookBaseConfig.plugins.concat(plugins),
    devtool: 'inline-source-map',
  });

};
