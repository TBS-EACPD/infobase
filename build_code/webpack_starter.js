/* eslint-disable no-console */
const webpack = require('webpack');
const path = require('path');
const gitsha = require('git-bundle-sha');
const { create_config } = require('./webpack_common.js');


var args = process.argv;

function choose(name){
  return (args.indexOf(name) > -1) && name;
}

var prod = !!choose('PROD');
var babel = !choose('NO-BABEL');
var both = !!choose('BOTH');
var NO_WATCH = !!choose("NO-WATCH")

var a11y_client = choose('a11y_client');
var new_client = choose('new_client');
var old_client = choose('old_client');

const app = a11y_client || new_client || old_client;


const options_by_app = {
  //new client is getting killed off, I'll leave the a11y part here in case we forget how apollo works.
  new_client: {
    entry: './src/new_client/a11y/index.js',
    get_output: language => ({
      path: path.resolve(__dirname, '../build/new_client/'),
      filename: `app-a11y-${language}.min.js`,
    }),
  },
  a11y_client: {
    entry: './src/InfoBase/a11y_root.js',
    get_output: language =>({
      path: path.resolve(__dirname, '../build/InfoBase/'),
      filename: `app-a11y-${language}.min.js`,
    }),
  },
  old_client: {
    entry: './src/InfoBase/root.js',
    get_output: language => ({
      path: path.resolve(__dirname, '../build/InfoBase/'),
      filename: `app-${language}.min.js`,
    }),
  },
};

console.log(`
  app: ${app},
  prod: ${prod}, 
  babel: ${babel}, 
  both languages: ${both}
`);



gitsha(function(err,commit_sha){
  if(err){ throw err; }

  const app_options = options_by_app[app];


  const langs = both ? [ 'en', 'fr' ] : ['en'];
  const config = langs.map(lang => create_config({
    commit_sha,
    language: lang,
    is_prod: prod,
    should_use_babel: babel,
    entry: app_options.entry,
    output: app_options.get_output(lang),
  }));

  if(NO_WATCH){
    webpack(config, function(err,stats){
      console.log(stats.toString({cached:true,modules:true}));
    });
  } else {
    webpack(config)
      .watch({
        //uncomment these lines if watch isn't working properly
        //aggregateTimeout:300, 
        //poll:true
      },function(err,stats){
        console.log(stats.toString({cached:true,modules:true}));

      });
  
  }
  
});