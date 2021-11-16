/* eslint-disable no-console */
const path = require("path");

const gitsha = require("git-bundle-sha");

const ip = require("ip");
const _ = require("lodash");
const webpack = require("webpack");

const { create_config } = require("./webpack_common");

function arg_is_present(name) {
  return process.argv.indexOf(name) > -1;
}

const en = arg_is_present("EN");
const fr = arg_is_present("FR");
const is_a11y_build = arg_is_present("A11Y");
const is_prod_build = arg_is_present("PROD");
const force_source_map = arg_is_present("PROD_SOURCE_MAP");
const no_watch = arg_is_present("NO-WATCH");

const build_dir_name = process.env.BUILD_DIR || "build";
const cdn_url = process.env.CDN_URL || ".";
const is_dev_link = process.env.IS_DEV_LINK || false;
const is_actual_prod_release = process.env.IS_ACTUAL_PROD_RELEASE || false;
const previous_deploy_sha = process.env.PREVIOUS_DEPLOY_SHA || false;
const is_ci =
  process.env.CI &&
  (typeof process.env.CI !== "string" ||
    process.env.CI.toLowerCase() !== "false");

const local_ip = ip.address();

const app = is_a11y_build ? "a11y_client" : "main_client";

const produce_stats = is_ci;
const stats_baseline = is_ci && process.env.CIRCLE_BRANCH === "master";

const common_output_options = {
  path: path.resolve(__dirname, `../${build_dir_name}/InfoBase/app/`),
  publicPath: `${cdn_url}/app/`,
  ...(cdn_url !== "." && { crossOriginLoading: "anonymous" }),
};
const options_by_app = {
  a11y_client: {
    get_output: (language) => ({
      ...common_output_options,
      filename: `app-a11y-${language}.min.js`,
      chunkFilename: `[name].app-ally-${language}${
        is_prod_build ? ".[contenthash]" : ""
      }.min.js`,
    }),
  },
  main_client: {
    get_output: (language) => ({
      ...common_output_options,
      filename: `app-${language}.min.js`,
      chunkFilename: `[name].app-${language}${
        is_prod_build ? ".[contenthash]" : ""
      }.min.js`,
    }),
  },
};

const langs = _.chain([en && "en", fr && "fr"])
  .compact()
  .thru((langs) => (_.isEmpty(langs) ? ["en"] : langs))
  .value();

console.log(`
  app: ${app}
  languages: ${langs}
  is prod: ${
    !is_prod_build
      ? "false"
      : `true\n    forcing source map: ${force_source_map}`
  }
  stats: ${
    !produce_stats ? "false" : `true\n    stats baseline: ${stats_baseline}`
  }
`);

gitsha(function (err, commit_sha) {
  if (err) {
    throw err;
  }

  const app_options = options_by_app[app];

  const config = langs.map((lang) =>
    create_config({
      context: path.resolve(__dirname, `..`),
      entry: "./src/InfoBase/root.js",
      output: app_options.get_output(lang),
      commit_sha,
      lang,
      is_a11y_build,
      is_prod_build,
      force_source_map,
      produce_stats,
      stats_baseline,
      cdn_url,
      is_dev_link,
      is_actual_prod_release,
      previous_deploy_sha,
      is_ci,
      local_ip,
    })
  );

  if (no_watch) {
    webpack(config, function (err, stats) {
      console.log(stats && stats.toString({ cached: true, modules: true }));
      if (err || stats.hasErrors()) {
        console.log(err);
        process.exitCode = 1;
      }
    });
  } else {
    webpack(config).watch(
      {
        //uncomment these lines if watch isn't working properly
        //aggregateTimeout:300,
        //poll:true
        ignored: /node_modules/,
      },
      function (err, stats) {
        if (err) {
          console.log(err);
        }
        console.log(stats.toString({ cached: true, modules: true }));
      }
    );
  }
});
