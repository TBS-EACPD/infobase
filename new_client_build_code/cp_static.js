//glob.sync takes a pattern and returns an array of  filenames matching that pattern
//fse just adds the ability to do 'cp -r' to the regular filesystem tools for node
const glob = require('glob');
const fse = require('fs-extra');
const fs = require("fs");
const cp = require("child_process");
const _ = require("lodash");
const Handlebars = require('handlebars');

global._ = _; //global is the 'window' on the node environment

const { index_lang_lookups } = require("../src/InfoBase/index_data.js");

const external_deps_names = glob.sync('external-dependencies/*.js');

const file_to_str = path => fs.readFileSync(path).toString('utf8');


function get_index_pages(){
  const template = file_to_str("./src/new_client/index.hbs.html");
  const func = Handlebars.compile(template);

  const en_lang_lookups = _.mapValues(index_lang_lookups, 'en');
  const fr_lang_lookups = _.mapValues(index_lang_lookups, 'fr');

  return {
    en: func(en_lang_lookups),
    fr: func(fr_lang_lookups),
  };

}

function make_dir_if_exists(dir_name){
  if (!fse.existsSync(dir_name)){
    fse.mkdirSync(dir_name);
  }
};

var build_proj = function(){
  

  const assets_by_type = {
    js: external_deps_names,
    other: [
      'src/robots/robots.txt',
      'src/common_css/container-page.css',
    ],
  };

  const dir = 'build/new_client';

  make_dir_if_exists('build');
  make_dir_if_exists(dir);

  fse.copySync('external-dependencies/GCWeb', dir+'/GCWeb', {clobber: true});
  fse.copySync('external-dependencies/img', dir+'/img', {clobber: true});
  fse.copySync('external-dependencies/wet-boew', dir+'/wet-boew', {clobber: true});
  fse.copySync('external-dependencies/cioscripts', dir+'/cioscripts', {clobber: true});
  fse.copySync('external-dependencies/ajax', dir+'/ajax', {clobber: true});

  //clobber overwrites old directory when copying 
  _.each(assets_by_type, (paths, type) => {
    
    var this_dir = (
      type === "other" ? 
      dir : 
      `${dir}/${type}`
    );
    make_dir_if_exists(this_dir);

    _.each(paths, path => {
      const small_name = _.last(path.split('/')); // dir/file.js -> file.js
      
      console.log('copying:' + small_name);
      
      fse.copySync(path, this_dir+'/'+small_name, {clobber: true});
      
    });
  }); 

  _.each(get_index_pages(), (file, lang) => {
    const lang_suffix = lang === 'en' ? "eng" : "fra";
    fs.writeFileSync(
      `${dir}/index-${lang_suffix}.html`,
      file
    );
  });

  console.log("\n done \n");
};


build_proj();



