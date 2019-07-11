/* eslint-disable no-console */
const webpack = require('webpack');
const path = require('path');
const gitsha = require('git-bundle-sha');
const { create_config } = require('./webpack_common.js');
const ip = require('ip');

const build_dir_name = process.env.BUILD_DIR || "build";
const args = process.argv;

const is_ci = process.env.CI && (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false');

function choose(name){
  return (args.indexOf(name) > -1) && name;
}

const prod = !!choose('PROD');
const babel = !choose('NO-BABEL');
const both = !!choose('BOTH');
const NO_WATCH = !!choose("NO-WATCH");

const a11y_client = choose('a11y_client');
const main_client = choose('main_client');

const app = a11y_client || main_client;

const common_entry = [ "@babel/polyfill" ];

const options_by_app = {
  a11y_client: {
    entry: common_entry.concat(['./src/InfoBase/root.js']),
    get_output: language =>({
      path: path.resolve(__dirname, `../${build_dir_name}/InfoBase/app/`),
      filename: `app-a11y-${language}.min.js`,
      chunkFilename: `[id].app-ally-${language}${prod ? ".[chunkhash]" : ""}.min.js`,
    }),
  },
  main_client: {
    entry: common_entry.concat(['./src/InfoBase/root.js']),
    get_output: language => ({
      path: path.resolve(__dirname, `../${build_dir_name}/InfoBase/app/`),
      filename: `app-${language}.min.js`,
      chunkFilename: `[id].app-${language}${prod ? ".[chunkhash]" : ""}.min.js`,
    }),
  },
};

console.log(`
  app: ${app},
  prod: ${prod}, 
  babel: ${babel}, 
  both languages: ${both}
`);


gitsha(function(err, commit_sha){
  if(err){ throw err; }

  const app_options = options_by_app[app];

  const langs = both ? [ 'en', 'fr' ] : ['en'];
  const config = langs.map(lang => create_config({
    commit_sha,
    language: lang,
    a11y_client,
    is_prod_build: prod,
    local_ip: ip.address(),
    is_ci,
    should_use_babel: babel,
    entry: app_options.entry,
    output: app_options.get_output(lang),
  }));

  if(NO_WATCH){
    webpack(config, function(err, stats){
      console.log( stats.toString({cached: true, modules: true}) );
      if( err || stats.hasErrors() ){ process.exitCode = 1; } 
    });
  } else {
    webpack(config)
      .watch({
        //uncomment these lines if watch isn't working properly
        //aggregateTimeout:300, 
        //poll:true
      },function(err, stats){
        console.log( stats.toString({cached: true, modules: true}) );
      });
  }
});