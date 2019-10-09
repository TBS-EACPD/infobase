const _ = require('lodash');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { BundleStatsWebpackPlugin } = require('bundle-stats');

const CDN_URL = process.env.CDN_URL || ".";
const IS_DEV_LINK = process.env.IS_DEV_LINK || false;
const IS_PROD_RELEASE = process.env.IS_PROD_RELEASE || false;
const CI_AND_MASTER = process.env.CIRCLE_BRANCH === "master";

const get_rules = ({
  should_use_babel,
  language,
  is_prod_build,
}) => {
  const js_module_loader_rules = [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        sourceType: "unambiguous", // needed if we've still got CommonJS modules being shared by src and build_code
        plugins: ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-syntax-dynamic-import"],
        presets: [
          ["@babel/preset-env", {
            useBuiltIns: false,
            modules: false,
            targets: should_use_babel ? 
              {
                Safari: "7",
                ie: "11",
              } : 
              {
                Chrome: "66",
              },
            forceAllTransforms: is_prod_build, // need to forceAllTransforms when uglifying
          }],
          "@babel/preset-react",
        ],
      },
    },
    {
      loader: 'eslint-loader',
    },
  ];

  return [
    {
      test: (module_name) => /\.js$/.test(module_name) && !/\.side-effects\.js$/.test(module_name),
      exclude: /node_modules/,
      use: js_module_loader_rules,
    },
    {
      test: /\.side-effects\.js$/, 
      exclude: /node_modules/,
      use: js_module_loader_rules,
      sideEffects: true,
    },
    {
      test: /\.css$/,
      use: [
        { loader: "style-loader" },
        { 
          loader: "css-loader",
          options: { 
            url: false,
          },
        },
      ],
      sideEffects: true,
    },
    {
      test: /\.scss$/,
      use: [
        { loader: "style-loader" }, // creates style nodes from JS strings }, 
        { loader: "css-loader" }, // translates CSS into CommonJS
        { loader: "sass-loader"}, // compiles Sass to CSS 
      ],
      sideEffects: true,
    },
    {
      test: /\.yaml$/,
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
    {
      test: /\.svg$/,
      loader: 'svg-inline-loader',
    },
  ];
};

function get_plugins({
  is_prod_build,
  language,
  a11y_client,
  commit_sha,
  local_ip,
  is_ci,
  bundle_stats,
  stats_baseline,
  stats_no_compare, 
}){
  return _.filter([
    new webpack.DefinePlugin({
      CDN_URL: JSON.stringify(CDN_URL),
      SHA: JSON.stringify(commit_sha),
      BUILD_DATE: JSON.stringify( new Date().toLocaleString("en-CA", {timeZone: "America/Toronto"}).replace(/,.+/, '') ),
      APPLICATION_LANGUAGE: JSON.stringify(language),
      IS_A11Y_MODE: !!a11y_client,
      IS_DEV: !IS_PROD_RELEASE,
      IS_DEV_LINK,
      IS_CI: JSON.stringify(is_ci),
      LOCAL_IP: JSON.stringify(local_ip),
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        const allowed_circular_dependencies = [
          ["src/metadata/data_sources.js", "src/core/TableClass.js"],
        ];

        const detected_circular_dependency_is_allowed = _.some(
          allowed_circular_dependencies,
          (allowed_circular_dependency) => _.every( paths, path => _.includes(allowed_circular_dependency, path) )
        );

        if (!detected_circular_dependency_is_allowed){
          compilation.warnings.push( new Error(`${paths.join(' -> ')} \x1b[33m(circular dependency)\x1b[0m`) );
        }
      },
    }),
    bundle_stats &&
      new BundleStatsWebpackPlugin({
        // In CI, always save baseline stats if on master, otherwise defer to argument
        baseline: is_ci ? CI_AND_MASTER : stats_baseline,
        compare: !stats_no_compare,
        json: true,
        outDir: '../..', // this path is relative to the weback output dir (client/build/InfoBase/app usually)
      }),
    is_prod_build && new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
    is_prod_build && new webpack.optimize.ModuleConcatenationPlugin(),
  ]);
};

function get_optimizations(is_prod_build, bundle_stats){
  if(is_prod_build){
    return {
      // using names as ids required for comparison between builds in stats, but adds weight to output (particularily to entry point),
      // so not desired in prod builds for deploy puposes
      moduleIds: bundle_stats ? 'named' : 'size',
      chunkIds: bundle_stats ? 'named' : 'size',
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
  a11y_client,
  commit_sha,
  is_prod_build,
  local_ip,
  is_ci,
  should_use_babel,
  produce_stats,
  stats_baseline,
  stats_no_compare,
}){

  const new_output = _.clone(output);
  if(CDN_URL !== "."){
    new_output.crossOriginLoading = "anonymous";
  }
  new_output.publicPath = `${CDN_URL}/app/`;

  // bundle stats only output for standard english build, for comparison consistency
  const bundle_stats = (produce_stats || (is_prod_build && is_ci)) && (language === "en") && !a11y_client;

  return {
    name: language,
    mode: is_prod_build ? 'production' : 'development',
    entry,
    output: new_output,
    module: {
      rules: get_rules({ should_use_babel, language, is_prod_build}),
      noParse: /\.csv$/,
    },
    plugins: get_plugins({
      is_prod_build,
      language,
      a11y_client,
      commit_sha,
      local_ip,
      is_ci,
      bundle_stats,
      stats_baseline,
      stats_no_compare,
    }),
    optimization: get_optimizations(is_prod_build, bundle_stats),
    devtool: (
      is_prod_build ? 
        false : 
        'inline-source-map'
    ),
  };
}

module.exports = exports = {
  create_config,
};