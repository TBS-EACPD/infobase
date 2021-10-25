const path = require("path");

const { BundleStatsWebpackPlugin } = require("bundle-stats-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const _ = require("lodash");
const string_hash = require("string-hash");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const { RetryChunkLoadPlugin } = require("webpack-retry-chunk-load-plugin");

const CDN_URL = process.env.CDN_URL || ".";
const IS_DEV_LINK = process.env.IS_DEV_LINK || false;
const IS_ACTUAL_PROD_RELEASE = process.env.IS_ACTUAL_PROD_RELEASE || false;
const PREVIOUS_DEPLOY_SHA = process.env.PREVIOUS_DEPLOY_SHA || false;

const get_rules = ({ language, target_ie11, is_prod_build }) => {
  const js_module_loader_rules = [
    {
      loader: "babel-loader",
      options: {
        cacheDirectory: true,
        plugins: [
          [
            "@babel/plugin-proposal-decorators",
            { decoratorsBeforeExport: false },
          ],
        ],
        presets: [
          [
            "@babel/preset-env",
            {
              useBuiltIns: "entry",
              corejs: { version: "3.18" },
              targets: target_ie11 ? ["IE 11", "Safari 7"] : "defaults",
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

  const interop_scss_regex = /\.interop\.scss$/;

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
      // transpilling core-js breaks some of its feature detection, exclude it. TODO: possible other polyfills should also be excluded?
      exclude: /node_modules\/core-js\/.*/,
      use: js_module_loader_rules,
      // up to dependencies to declare sideEffects true/false in their package.json
    },
    {
      test: /\.scss$/,
      exclude: interop_scss_regex,
      use: [
        { loader: "style-loader" },
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
      test: interop_scss_regex,
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
    },
    {
      test: /\.csv$/,
      use: [{ loader: "raw-loader", options: { esModule: false } }],
    },
    {
      test: /\.svg$/,
      loader: "svg-inline-loader",
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
    },
    {
      test: /\.json$/,
      exclude: /node_modules/, // don't run on dependencies, if they're already internally loading their own json then applying the loader a second time fails (it's no longer valid json the second time)
      use: [{ loader: "json-loader" }],
    },
  ];
};

function get_plugins({
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
      IS_DEV: !IS_ACTUAL_PROD_RELEASE,
      IS_DEV_LINK,
      IS_CI: JSON.stringify(is_ci),
      LOCAL_IP: JSON.stringify(local_ip),
    }),
    new RetryChunkLoadPlugin({
      retryDelay: 100,
      maxRetries: 3,
    }),
    new ESLintPlugin({ extensions: ["js", "ts", "tsx"], cache: true }),
    new ForkTsCheckerWebpackPlugin({
      async: true,
      typescript: { configFile: "tsconfig.json" },
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        /*
          Reminder: circular dependencies aren't _necessarily_ problematic. The concern is that when they _are_ the source of a bug,
          they can be a very hard to identify source. Best to avoid creating them, but at a certain point avoiding them can start
          costing a lot in code organization (e.g. immagine if all the inter-linked subjects were in a single module, oof). 

          If it's unavoidable _and_ you're confident it's safe, you can allow-list the cycles here. At least we have the list, if not
          the active warnings, in case a future circular dependency bug arrises.

          To my understanding, an unsafe cyclic dependency is going to be one where the cycle is hit during initial execution of either module.
          In that case, you're likely to have run time errors saying that one import or the other is undefined (it'll probably like it's webpack related,
          but it's not). A safe cycle, on the other hand, could be one where the members of the cycle only directly reference eachother from within exported
          functions. By the time some module outside of the cycle imports and executes that function, the members of the cycle will have made it through 
          their initial execution safely.
        */
        const allowed_circular_dependencies = [
          ["src/metadata/data_sources.js", "src/core/TableClass.js"],
          ["src/models/subjects/Dept.ts", "src/models/subjects/CRSO.ts"],
          ["src/models/subjects/CRSO.ts", "src/models/subjects/Program.ts"],
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
  ]);
}

function get_optimizations({ is_prod_build, produce_stats }) {
  return {
    ...(is_prod_build && {
      /*
        Terser's parallel behaviour, the default is to spawn one worker per core, but 1) it is unable to accurately detect cores in CircleCI and 2),
        for local prod builds, this can deplete resources when multiple builds are run in parallel themselves (the standard behaviour for local prod
        builds). Disabling parallel builds makes the least common use of prod builds slightly slower, but makes the other uses more stable (and
        potentially faster, in the case of resource depletion)
      */
      minimizer: [new TerserPlugin({ parallel: false })],
    }),
    ...(produce_stats && {
      /*
        Using names as ids required to make bundle stats comparison between builds possible, and identity of bundles clearer.
        Warning: adds weight to output (particularily to entry point), so not desired in production builds intended for the live site
        (currently used in the dev links versions though, so remember that the dev links are slightly sub-optimal)
      */
      moduleIds: "named",
      chunkIds: "named",
    }),
  };
}

function create_config(options) {
  const {
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
  } = options;

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
    // TODO enable filesystem caching for actual prod release builds once fully confident in the caching setup
    cache: !IS_ACTUAL_PROD_RELEASE && {
      type: "filesystem",
      /*
        hash of options used as cache identifier, excluding some that satisfy both
          1) change too frequently for useful caching, and
          2) don't matter to caching (no impact on webpack config itself, just passed to build via DefinePlugin,
            and my testing shows that is independent of the caching itself)

        ... this WILL require future maintenance if options/behaviour changes, might be brittle. I chose to include ALL
        options, with only the necessary/safe exclusions, so that ideally failure just means sub-optimal caches, rather
        than builds with mixed caches/configs
      */
      name: _.chain(options)
        .omit(["commit_sha", "local_ip"])
        .thru((build_options) => string_hash(JSON.stringify(build_options)))
        .toString()
        .value(),
      buildDependencies: {
        // a bit vaguely named, but to clarify this means the cache will bust on any changes to _this_ module itself
        config: [__filename],
        // docs recommend a post-install script to clear the cache, but this seems like a better method imo
        packages: [path.resolve(__dirname, `../package-lock.json`)],
      },
      compression: is_ci ? "gzip" : false,
    },
    module: {
      rules: get_rules({
        target_ie11,
        language,
        is_prod_build,
      }),
      noParse: /\.csv$/,
    },
    plugins: get_plugins({
      language,
      a11y_client,
      commit_sha,
      local_ip,
      is_ci,
      produce_stats,
      stats_baseline,
      stats_no_compare,
    }),
    optimization: get_optimizations({ is_prod_build, produce_stats }),
    devtool: !is_prod_build ? "eval-source-map" : is_ci ? "source-map" : false,
    resolve: {
      fallback: { assert: false },
      modules: [path.resolve(__dirname, "../"), "node_modules/"],
      extensions: [".ts", ".js", ".tsx"],
    },
  };
}

module.exports = exports = {
  create_config,
  get_rules,
};
