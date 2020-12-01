/* eslint-disable no-console */
const path = require("path");

const gitsha = require("git-bundle-sha");

const ip = require("ip");
const _ = require("lodash");
const webpack = require("webpack");

const { create_config } = require("./webpack_common.js");

const build_dir_name = process.env.BUILD_DIR || "build";
const args = process.argv;

const is_ci =
  process.env.CI &&
  (typeof process.env.CI !== "string" ||
    process.env.CI.toLowerCase() !== "false");
const is_ci_and_master = is_ci && process.env.CIRCLE_BRANCH === "master";

function choose(name) {
  return args.indexOf(name) > -1 && name;
}

const prod = !!choose("PROD");
const babel = !choose("NO-BABEL");
const en = !!choose("EN");
const fr = !!choose("FR");
const no_watch = !!choose("NO-WATCH");
const stats = !!choose("STATS") || (prod && is_ci); // In CI, always generate stats
const stats_baseline = !!choose("STATS-BASELINE") || is_ci_and_master; // In CI, always save baseline stats if on master, otherwise defer to argument
const stats_no_compare = !!choose("STATS-NO-COMPARE");

const a11y_client = choose("a11y_client");
const main_client = choose("main_client");

const app = a11y_client || main_client;
const common_entry = ["@babel/polyfill", "./src/InfoBase/root.js"];
const options_by_app = {
  a11y_client: {
    entry: common_entry,
    get_output: (language) => ({
      path: path.resolve(__dirname, `../${build_dir_name}/InfoBase/app/`),
      filename: `app-a11y-${language}.min.js`,
      chunkFilename: `[name].app-ally-${language}${
        prod && !stats ? ".[contenthash]" : ""
      }.min.js`,
    }),
  },
  main_client: {
    entry: common_entry,
    get_output: (language) => ({
      path: path.resolve(__dirname, `../${build_dir_name}/InfoBase/app/`),
      filename: `app-${language}.min.js`,
      chunkFilename: `[name].app-${language}${
        prod && !stats ? ".[contenthash]" : ""
      }.min.js`,
    }),
  },
};

const langs = _.chain([en && "en", fr && "fr"])
  .compact()
  .thru((langs) => (_.isEmpty(langs) ? ["en"] : langs))
  .value();

console.log(`
  app: ${app},
  prod: ${prod}, 
  babel: ${babel},
  languages: ${langs},
`);

gitsha(function (err, commit_sha) {
  if (err) {
    throw err;
  }

  const app_options = options_by_app[app];

  const config = langs.map((lang) =>
    create_config({
      commit_sha,
      language: lang,
      a11y_client,
      is_prod_build: prod,
      local_ip: ip.address(),
      is_ci,
      should_use_babel: babel,
      produce_stats: stats,
      stats_baseline,
      stats_no_compare,
      entry: app_options.entry,
      output: app_options.get_output(lang),
    })
  );

  if (no_watch) {
    webpack(config, function (err, stats) {
      console.log(stats.toString({ cached: true, modules: true }));
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
