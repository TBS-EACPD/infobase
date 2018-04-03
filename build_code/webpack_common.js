const _ = require('lodash');
var webpack = require('webpack');

const get_rules = ({ 
  should_use_babel,
  language,
}) => [
  {
    test: /^((?!\.exec).)*\.js$/, 
    exclude: /node_modules|external-dependencies/, //es2015 loader adds 'use strict' everywhere, which breaks scripts from external-dependencies/
    use: [
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: should_use_babel ? ['react','es2015'] : ['react'],
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
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: false,
  }),
  new webpack.optimize.ModuleConcatenationPlugin(),
]

function get_plugins({ is_prod, language, commit_sha, envs }){
  const CDN_URL = process.env.CDN_URL || ".";
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

function create_config({
  entry,
  output,
  language,
  commit_sha,
  is_prod,
  should_use_babel,
}){

  return {
    name: language,
    entry,
    output,
    module: {
      rules: get_rules({ should_use_babel, language}),
      noParse: /\.csv$/,
    },
    plugins: get_plugins({
      is_prod,
      language,
      commit_sha,
    }),
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