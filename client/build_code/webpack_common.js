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

const get_rules = ({
  lang,
  is_prod_build,
  is_actual_prod_release,
  instrument_with_istanbul,
}) => {
  const babel_loader_options = {
    loader: "babel-loader",
    options: {
      // want to make sure that, even when transpiling node_modules for production, we only ever use the /client babel config
      configFile: path.resolve(__dirname, `../.babelrc.json`),
      // istanbul plugin adds necessary instrumentation for producing coverage reports (necessary outside of jest, notably with cypress)
      ...(instrument_with_istanbul && {
        plugins: ["istanbul"],
      }),
    },
  };

  const js_module_suffix_pattern = "\\.(js|ts|tsx)$";
  const side_effects_suffix_pattern = `\\.side-effects${js_module_suffix_pattern}`;

  const interop_scss_regex = /\.interop\.scss$/;

  return [
    {
      test: new RegExp(js_module_suffix_pattern),
      exclude: new RegExp(`node_modules|${side_effects_suffix_pattern}`),
      use: babel_loader_options,
      sideEffects: false,
    },
    {
      test: new RegExp(side_effects_suffix_pattern),
      exclude: /node_modules/,
      use: babel_loader_options,
      sideEffects: true,
    },
    {
      // ensure dependencies are transpiled for IE11 support when needed (much slower build, so only bother in prod builds)
      test: (path) => is_prod_build && /node_modules\/.*\.js$/.test(path),
      // transpilling core-js breaks some of its feature detection, exclude it
      exclude: /node_modules\/core-js\/.*/,
      use: {
        ...babel_loader_options,
        options: { ...babel_loader_options.options, plugins: [] },
      },
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
            mode: is_actual_prod_release ? "verify" : "emit",
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
      test: /\.yaml$/,
      exclude: /node_modules/, // custom loader, make sure not to hit node_modules with it
      use: [
        { loader: "json-loader" },
        {
          loader: "./build_code/loaders/yaml-lang-loader.js",
          options: { lang },
        },
      ],
    },
  ];
};

function get_plugins({
  lang,
  is_a11y_build,
  commit_sha,
  local_ip,
  is_ci,
  produce_stats,
  stats_baseline,
  stats_no_compare,
  cdn_url,
  previous_deploy_sha,
  is_actual_prod_release,
  is_dev_link,
  skip_typecheck,
}) {
  return _.filter([
    new webpack.DefinePlugin({
      CDN_URL: JSON.stringify(cdn_url),
      SHA: JSON.stringify(commit_sha),
      PREVIOUS_DEPLOY_SHA: JSON.stringify(previous_deploy_sha || commit_sha),
      BUILD_DATE: JSON.stringify(
        new Date()
          .toLocaleString("en-CA", { timeZone: "America/Toronto" })
          .replace(/,.+/, "")
      ),
      APPLICATION_LANGUAGE: JSON.stringify(lang),
      IS_A11Y_MODE: !!is_a11y_build,
      IS_DEV: !is_actual_prod_release,
      IS_DEV_LINK: is_dev_link,
      IS_CI: JSON.stringify(is_ci),
      LOCAL_IP: JSON.stringify(local_ip),
    }),
    new RetryChunkLoadPlugin({
      retryDelay: 100,
      maxRetries: 3,
    }),
    new ESLintPlugin({ extensions: ["js", "ts", "tsx"], cache: true }),
    !skip_typecheck &&
      new ForkTsCheckerWebpackPlugin({
        async: true,
        typescript: { configFile: "tsconfig.json" },
      }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      onDetected({ paths, compilation }) {
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
    commit_sha,
    lang,
    is_a11y_build,
    is_prod_build,
    force_source_map,
    produce_stats,
    stats_baseline,
    stats_no_compare,
    cdn_url,
    is_dev_link,
    is_actual_prod_release,
    previous_deploy_sha,
    is_ci,
    local_ip,
    skip_typecheck,
    instrument_with_istanbul,
  } = options;

  return {
    name: lang,
    mode: is_prod_build ? "production" : "development",
    context,
    entry,
    output,
    cache: !is_actual_prod_release && {
      type: "filesystem",
      compression: "gzip",
      /*
        Currently, webpack requires users to manually version (or otherwise bust) caches when webpack/plugin configuration changes,
        or else the cache use could potentially produce broken builds. From my testing, very few of our options produce posioned builds
        on change BUT better safe (and slightly inefficient) than sorry. Using a hash of the build options as a cache identifier, 
        excluding some safe/unstable options, to achieve this. 

        ... this WILL require future maintenance if options/behaviour changes, might be brittle. I chose to include ALL
        options, with only the necessary/safe exclusions, so that ideally failure just means sub-optimal caches, rather
        than builds with mixed caches/configs.
      */
      name: _.chain(options)
        .omit([
          "commit_sha",
          "previous_deploy_sha",
          "local_ip",
          "skip_typecheck",
        ])
        .thru((build_options) => string_hash(JSON.stringify(build_options)))
        .toString()
        .value(),
      buildDependencies: {
        // a bit vaguely named, but to clarify this means the cache will bust on any changes to _this_ module itself
        config: [__filename],
        // docs recommend a post-install script to clear the cache, but this seems like a better method imo
        packages: [path.resolve(__dirname, `../package-lock.json`)],
        babel: [path.resolve(__dirname, `../.babelrc.json`)],
      },
    },
    module: {
      rules: get_rules({
        lang,
        is_prod_build,
        is_actual_prod_release,
        instrument_with_istanbul,
      }),
      noParse: /\.csv$/,
    },
    plugins: get_plugins({
      lang,
      is_a11y_build,
      commit_sha,
      local_ip,
      is_ci,
      produce_stats,
      stats_baseline,
      stats_no_compare,
      cdn_url,
      previous_deploy_sha,
      is_actual_prod_release,
      is_dev_link,
      skip_typecheck,
    }),
    optimization: get_optimizations({ is_prod_build, produce_stats }),
    devtool: !is_prod_build
      ? "eval-source-map"
      : force_source_map && "source-map",
    resolve: {
      fallback: { assert: false },
      modules: [path.resolve(__dirname, "../"), "node_modules/"],
      extensions: [".ts", ".js", ".tsx"],
    },
  };
}

module.exports = exports = {
  create_config,
};
