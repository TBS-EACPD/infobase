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
  const main_template = file_to_str("./src/new_client/index.hbs.html");
  const main_func = Handlebars.compile(main_template);

  const a11y_template = file_to_str("./src/new_client/a11y/index.hbs.html");
  const a11y_func = Handlebars.compile(a11y_template);

  const en_lang_lookups = _.mapValues(index_lang_lookups, 'en');
  const fr_lang_lookups = _.mapValues(index_lang_lookups, 'fr');


  return {
    main: {
      en: main_func(en_lang_lookups),
      fr: main_func(fr_lang_lookups),
    },
    a11y: {
      en: a11y_func(en_lang_lookups),
      fr: a11y_func(fr_lang_lookups),
    }
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

  _.each(get_index_pages(), (proj, proj_key) => {
    const proj_prefix = proj_key === "a11y" ? "a11y" : "index";
    _.each(proj, (markup_file, lang_key) => {

      const lang_suffix = lang_key === 'en' ? "eng" : "fra";

      fs.writeFileSync(
        `${dir}/${proj_prefix}-${lang_suffix}.html`,
        markup_file
      );

    });
  });

  console.log("\n done \n");
};


build_proj();



