const std_lib_path = require("path");

const { BundleStatsWebpackPlugin } = require("bundle-stats-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const _ = require("lodash");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const CDN_URL = process.env.CDN_URL || ".";
const IS_DEV_LINK = process.env.IS_DEV_LINK || false;
const IS_PROD_RELEASE = process.env.IS_PROD_RELEASE || false;
const PREVIOUS_DEPLOY_SHA = process.env.PREVIOUS_DEPLOY_SHA || false;

const get_rules = ({ language, target_ie11, is_prod_build }) => {
  const js_module_loader_rules = [
    {
      loader: "babel-loader",
      options: {
        cacheDirectory: true,
        sourceType: "unambiguous", // needed if we've still got CommonJS modules being shared by src and build_code
        plugins: [
          "@babel/plugin-proposal-object-rest-spread",
          "@babel/plugin-syntax-dynamic-import",
          [
            "@babel/plugin-proposal-decorators",
            { decoratorsBeforeExport: false },
          ],
          "@babel/plugin-proposal-class-properties",
        ],
        presets: [
          [
            "@babel/preset-env",
            {
              useBuiltIns: false,
              modules: false,
              targets: target_ie11
                ? ["ie 11", "Safari 7"]
                : "last 2 Chrome versions",
              forceAllTransforms: is_prod_build, // need to forceAllTransforms when minifying
            },
          ],
          "@babel/preset-react",
          "@babel/preset-typescript",
        ],
      },
    },
  ];

  const js_module_suffix_pattern = "\\.(js|ts|tsx)$";
  const side_effects_suffix_pattern = `\\.side-effects${js_module_suffix_pattern}`;

  return [
    {
      test: new RegExp(js_module_suffix_pattern),
      exclude: new RegExp(`node_modules|${side_effects_suffix_pattern}`),
      use: js_module_loader_rules,
      sideEffects: false,
    },
    {
      test: new RegExp(side_effects_suffix_pattern),
      exclude: /node_modules/,
      use: js_module_loader_rules,
      sideEffects: true,
    },
    {
      // ensure dependencies are transpiled for IE11 support when needed
      test: (path) => target_ie11 && /node_modules\/.*\.js$/.test(path),
      use: js_module_loader_rules,
      // up to dependencies to declare sideEffects true/false in their package.json
    },
    {
      test: /\.scss$/,
      exclude: /\.interop\.scss$/,
      use: [
        is_prod_build
          ? MiniCssExtractPlugin.loader
          : { loader: "style-loader" },
        {
          loader: "css-loader",
          options: {
            importLoaders: 1,
            modules: {
              mode: "icss",
            },
          },
        },
        { loader: "sass-loader" },
      ],
      sideEffects: true,
    },
    {
      test: /\.interop\.scss$/,
      use: [
        {
          loader: "css-modules-typescript-loader",
          options: {
            mode: is_prod_build ? "verify" : "emit",
          },
        },
        {
          loader: "css-loader",
          options: {
            importLoaders: 1,
            esModule: true,
            modules: {
              mode: "local",
              namedExport: true,
            },
          },
        },
        { loader: "sass-loader" },
        {
          loader: "./build_code/loaders/sass-interop-loader.js",
        },
      ],
      sideEffects: false,
    },
    {
      test: /\.csv$/,
      use: [{ loader: "raw-loader", options: { esModule: false } }],
      sideEffects: false,
    },
    {
      test: /\.svg$/,
      loader: "svg-inline-loader",
      sideEffects: false,
    },
    {
      test: /\.yaml$/,
      exclude: /node_modules/, // custom loader, make sure not to hit node_modules with it
      use: [
        { loader: "json-loader" },
        {
          loader: "./build_code/loaders/yaml-lang-loader.js",
          options: { lang: language },
        },
      ],
      sideEffects: false,
    },
    {
      test: /\.json$/,
      exclude: /node_modules/, // don't run on dependencies, if they're already internally loading their own json then applying the loader a second time fails (it's no longer valid json the second time)
      use: [{ loader: "json-loader" }],
      sideEffects: false,
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
  produce_stats,
  stats_baseline,
  stats_no_compare,
}) {
  return _.filter([
    new webpack.DefinePlugin({
      CDN_URL: JSON.stringify(CDN_URL),
      SHA: JSON.stringify(commit_sha),
      PREVIOUS_DEPLOY_SHA: JSON.stringify(PREVIOUS_DEPLOY_SHA || commit_sha),
      BUILD_DATE: JSON.stringify(
        new Date()
          .toLocaleString("en-CA", { timeZone: "America/Toronto" })
          .replace(/,.+/, "")
      ),
      APPLICATION_LANGUAGE: JSON.stringify(language),
      IS_A11Y_MODE: !!a11y_client,
      IS_DEV: !IS_PROD_RELEASE,
      IS_DEV_LINK,
      IS_CI: JSON.stringify(is_ci),
      LOCAL_IP: JSON.stringify(local_ip),
    }),
    new ESLintPlugin({ extensions: ["js", "ts", "tsx"] }),
    new ForkTsCheckerWebpackPlugin({
      async: true,
      typescript: { configFile: "tsconfig.json" },
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        const allowed_circular_dependencies = [
          ["src/metadata/data_sources.js", "src/core/TableClass.js"],
        ];

        const detected_circular_dependency_is_allowed = _.some(
          allowed_circular_dependencies,
          (allowed_circular_dependency) =>
            _.every(paths, (path) =>
              _.includes(allowed_circular_dependency, path)
            )
        );

        if (!detected_circular_dependency_is_allowed) {
          compilation.warnings.push(
            new Error(
              `${paths.join(" -> ")} \x1b[33m(circular dependency)\x1b[0m`
            )
          );
        }
      },
    }),
    produce_stats &&
      new BundleStatsWebpackPlugin({
        baseline: stats_baseline,
        compare: !stats_no_compare,
        json: true,
        outDir: "..",
      }),
    is_prod_build &&
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production"),
        },
      }),
    is_prod_build && new webpack.optimize.ModuleConcatenationPlugin(),
    is_prod_build && new MiniCssExtractPlugin(),
  ]);
}

function get_optimizations(is_prod_build, is_ci, produce_stats) {
  if (is_prod_build) {
    return {
      ...(produce_stats && {
        // using names as ids required for clear bundle stats comparison between builds, but adds weight to output
        // (particularily to entry point), so not desired in production builds intended for the live site
        moduleIds: "named",
        chunkIds: "named",
      }),
      minimize: true,
      // Terser's parallel behaviour is to spawn one worker per core, but 1) it is unable to accurately detect cores in CircleCI and 2), for local
      // prod builds, this can deplete resources when multiple builds are run in parallel themselves (the standard behaviour for local prod builds).
      // Disabling parallel builds makes the least common use of prod builds slightly slower, but makes the other uses more stable (and potentially
      // faster, in the case of resource depletion)
      minimizer: [new TerserPlugin({ parallel: false })],
      splitChunks: {
        maxAsyncRequests: 20,
        chunks: "async",
      },
    };
  } else {
    return {};
  }
}

function create_config({
  context,
  entry,
  output,
  language,
  a11y_client,
  commit_sha,
  is_prod_build,
  local_ip,
  is_ci,
  target_ie11,
  produce_stats,
  stats_baseline,
  stats_no_compare,
}) {
  const new_output = _.clone(output);
  new_output.publicPath = `${CDN_URL}/app/`;
  if (CDN_URL !== ".") {
    new_output.crossOriginLoading = "anonymous";
  }

  return {
    name: language,
    mode: is_prod_build ? "production" : "development",
    target: _.compact(["web", target_ie11 && "es5"]),
    context,
    entry,
    output: new_output,
    module: {
      rules: get_rules({
        target_ie11,
        language,
        is_prod_build,
      }),
      noParse: /\.csv$/,
    },
    plugins: get_plugins({
      is_prod_build,
      language,
      a11y_client,
      commit_sha,
      local_ip,
      is_ci,
      produce_stats,
      stats_baseline,
      stats_no_compare,
    }),
    optimization: get_optimizations(is_prod_build, is_ci, produce_stats),
    devtool: !is_prod_build ? "eval-source-map" : is_ci ? "source-map" : false,
    resolve: {
      fallback: { assert: false },
      modules: [std_lib_path.resolve(__dirname, "../"), "node_modules/"],
      extensions: [".ts", ".js", ".tsx"],
    },
  };
}

module.exports = exports = {
  create_config,
  get_rules,
};
