var webpack = require('webpack');
var path = require('path');
var gitsha = require('git-bundle-sha');

//read the CLI args in any order, using their existence/content alone to determine what is being passed
//node wbBuild.js (InfoBase|default=LED|TEST) (PROD|default=DEV) (default=EN|BOTH) (default=BABEL|NO-BABEL) (MOCHA|default=NO-MOCHA) (INTEGRATION|default:false)

var args = process.argv;

function choose(name){
  return (args.indexOf(name) > -1) && name;
}

var prod = !!choose('PROD');
var babel = !choose('NO-BABEL');
var both = !!choose('BOTH');

console.log(`
  prod: ${prod}, 
  babel: ${babel}, 
  both languages: ${both}
`);


//this will be added to the config, in the case of production we want the minification plugin
var env_plugins = []; 
if(prod){ 
  env_plugins = env_plugins.concat([
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ]);
} 

// this will print linting in the webpack output
//currently disabled because there is too much output
//You can lint without this, 
//using `eslint "src/**/*.js" though this will include deprecated files.
//js_stuff.loaders.push('eslint-loader');

var langs = both ? ['en','fr'] : ['en'];

var config_from_sha = function(sha){
  return langs.map(function(language){
    return {
      name: language,
      entry: './src/InfoBase/root.js',
      output: {
        path: path.resolve(__dirname, '../build/InfoBase/'),
        filename: `app-${language}.min.js`,
      },
      module: {
        rules: [
          {
            test: /^((?!\.exec).)*\.js$/, 
            exclude: /node_modules|external-dependencies/, //es2015 loader adds 'use strict' everywhere, which breaks scripts from external-dependencies/
            use: [
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true,
                  presets: babel ? ['react','es2015'] : ['react'],
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
        ],
        noParse: /\.csv$/,
      },
      plugins:[ 
        //allows for compile-time globals 
        new webpack.DefinePlugin({
          SHA : JSON.stringify(sha),
          DEV: !prod,
          PRE_PUBLIC_ACCOUNTS: false,
          APPLICATION_LANGUAGE: JSON.stringify(language),
        }),
        //new webpack.OldWatchingPlugin() //this helped before when watching wasn't working, uncomment if similar issue
      ].concat(env_plugins),
      devtool: (
        prod? 
        false : 
        'inline-source-map'
      ),
    };
  });
};



gitsha(function(err,sha){
  if(err){ throw err; }
  var config = config_from_sha(sha)
  webpack(config)
    .watch({
      //uncomment these lines if watch isn't working properly
      //aggregateTimeout:300, 
      //poll:true
    },function(err,stats){
      console.log(stats.toString({cached:true,modules:true}));
    }
    );
})

