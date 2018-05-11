const _ = require('lodash');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const CDN_URL = process.env.CDN_URL || ".";

const get_rules = ({ 
  should_use_babel,
  language,
  is_prod,
}) => [
  {
    test: /^((?!\.exec).)*\.js$/, 
    exclude: /node_modules|external-dependencies/, //es2015 loader adds 'use strict' everywhere, which breaks scripts from external-dependencies/
    use: [
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          plugins: ["transform-object-rest-spread", "syntax-dynamic-import"],
          presets: [
            ["env", {
              modules: false,
              targets: {
                browsers: should_use_babel ?  ["Safari >= 7", "Explorer 11"] : ["Chrome >= 66"],
                uglify: is_prod,
              },
            }],
            "react",
          ],
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
    test: /\.ib.yaml$/, //consider having webpack create a split bundle for the result.
    use: [
      { loader: "./node_loaders/ib-text-loader.js" },
      { loader: "json-loader" },
      { 
        loader: "./node_loaders/yaml-lang-loader.js",
        options: {lang: language},
      },
    ],
  }, 
  {
    test: /^((?!\.ib).)*\.yaml$/, //consider having webpack create a split bundle for the result.
    use: [
      { loader: "json-loader" },
      { 
        loader: "./node_loaders/yaml-lang-loader.js",
        options: {lang: language},
      },
    ],
  },
  { 
    test: /\.csv$/,
    use: [ { loader: 'raw-loader' } ],
  },
  {
    test: /\.json$/,
    use: [{loader: 'json-loader'}],
  },
];


const prod_plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production'),
    },
  }),
  new webpack.optimize.ModuleConcatenationPlugin(),
]

function get_plugins({ is_prod, language, commit_sha, envs }){
  
  const plugins = [
    new webpack.DefinePlugin({
      SHA : JSON.stringify(commit_sha),
      DEV: !is_prod,
      APPLICATION_LANGUAGE: JSON.stringify(language),
      CDN_URL: JSON.stringify(CDN_URL),
    }),
  ];

  if(is_prod){
    return plugins.concat(prod_plugins);
  }

  return plugins;
};

function get_optimizations(is_prod){
  if(is_prod){
    return {
      minimizer: [
        new UglifyJSPlugin({ sourceMap: false }),
      ],
    };
  } else {
    return {};
  }
}

function create_config({
  entry,
  output,
  language,
  commit_sha,
  is_prod,
  should_use_babel,
}){

  const new_output = _.clone(output);
  if(CDN_URL !== "."){
    new_output.crossOriginLoading = "anonymous";
  }
  new_output.publicPath = `${CDN_URL}/app/`;

  return {
    name: language,
    mode: is_prod ? 'production' : 'development',
    entry,
    output: new_output,
    module: {
      rules: get_rules({ should_use_babel, language, is_prod}),
      noParse: /\.csv$/,
    },
    plugins: get_plugins({
      is_prod,
      language,
      commit_sha,
    }),
    optimization: get_optimizations(is_prod),
    devtool: (
      is_prod? 
      false : 
      'inline-source-map'
    ),
  }
}

module.exports = exports = {
  create_config,
}