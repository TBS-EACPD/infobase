/* eslint-disable no-console */

//glob.sync takes a pattern and returns an array of  filenames matching that pattern
//fse just adds the ability to do 'cp -r' to the regular filesystem tools for node
const glob = require('glob');
const fse = require('fs-extra');
const fs = require("fs");
const cp = require("child_process");
const _ = require("lodash");
const Handlebars = require('handlebars');
const d3_dsv = require('d3-dsv');

global._ = _; //global is the 'window' on the node environment

const { write_result_bundles } = require('./write_result_bundles.js');
const { get_footnote_file_defs } = require('./write_footnote_bundles.js');
const { index_lang_lookups } = require("../src/InfoBase/index_data.js");

/*
What this is

this script can be called with either IB or LED as argument

it copies stuff into the build directory

webpack makes it easier to handle yaml and css, 
the most complicated parts, so being less data-driven is 
actually simpler now.

PROJ -> {
  (mkdir if doesn't exist) build/, build/PROJ.name/, js/ , csv/ , png/
  copy PROJ.js to build/PROJ.name/js/ (this will include external dependencies)
  copy WET stuff -r to build/PROJ.name/
  copy other to build/PROJ.name (this is where index-en/fr get copied)
  forEach file in PROJ.spreadsheets, copy it to to build/PROJ.name/csv/
  forEach file  in PROJ.png, copy to build/PROJ.name/png/
}


idea for improvement: move a project's table to a json file in src/LED and src/InfoBase,
then have that be the ONLY source (dynamic requires are possible with webpack) of which tables are in which project

*/
const csv_names_by_table_id = require('../src/tables/table_id_to_csv_map.js');

const external_deps_names = glob.sync('external-dependencies/*.js')

const public_data_dir = "data/";

const public_dir_prefixer = file_name => public_data_dir+file_name;

function file_to_str(path){
  return fs.readFileSync(path).toString('utf8');
}

const common_lookups = _.map(
  [
    //tag lookups are small enough to keep bilingual
    'tags_to_programs.csv',
    'program_tags.csv',
    'program_tag_types.csv',

    //most igoc lookups are small enough to keep bilingual
    'DeptcodetoTableID.csv',
    'org_to_minister.csv',
    'ministers.csv',
    'ministries.csv',
    'inst_forms.csv',
    'url_lookups.csv',

    'budget_measure_lookups.csv',
    'budget_measure_allocations.csv',
  ], 
  public_dir_prefixer 
);


//these files are big and are explicitly split by the pipeline (bilingual bundles are also used elsewhere, though) 
const lang_specific_lookups = lang => [
  "program",
  "crso",
  "Glossary",
  "igoc",
].map( name => `${name}_${lang}.csv`);

const common_lookups_en = _.map(
  lang_specific_lookups("en"),
  public_dir_prefixer
);

const common_lookups_fr = _.map(
  lang_specific_lookups("fr"),
  public_dir_prefixer
);

const common_png = [
  //top left corner brand
  'src/InfoBase/goc--header-logo.svg',

  //small scma icons below home page search bar
  'src/home/results.png',
  'src/home/expend.png',
  'src/home/people.png',


  //caricature images for main 5 pages
  'src/home/partition.png',
  'src/home/bubbles.png',
  'src/home/Builder.png',
  'src/home/structure_panel.png',
  'src/home/explorer.png',

  //simplographic images
  'src/panels/intro_graphs/Check.svg',
  'src/panels/intro_graphs/Graph.svg',
  'src/panels/intro_graphs/Money.svg',
  'src/panels/intro_graphs/People.svg',

];

const IB_tables = [
  'table1',
  'table2',
  'table4',
  'table5',
  'table6',
  'table7',
  'table8',
  'table9',
  'table10',
  'table11',
  'table12',
  'table305',
  'table300',
  //'table112', // waiting on data
  //'table302',
  //'table303',
  //'table304',
];

var csv_from_table_names = function(table_ids){
  return _.map(table_ids, function(table_id){
    const obj = csv_names_by_table_id[table_id];
    const prefix = public_data_dir;

    return prefix+obj.url;
  });
};

var IB = {
  name: 'InfoBase',
  lookups_en  : common_lookups.concat(common_lookups_en),
  lookups_fr  : common_lookups.concat(common_lookups_fr),
  csv: csv_from_table_names(IB_tables),
  png: common_png,
  js: external_deps_names,
  other: [ 'src/robots/robots.txt','src/common_css/container-page.css'],
};

function get_index_pages(){
  const CDN_URL = process.env.CDN_URL || "."; 
  console.log(`CDN_URL: ${CDN_URL}`);
  const template = file_to_str("./src/InfoBase/index.hbs.html");
  const template_func = Handlebars.compile(template);

  const en_lang_lookups = _.mapValues(index_lang_lookups, 'en');
  const fr_lang_lookups = _.mapValues(index_lang_lookups, 'fr');
  _.each([en_lang_lookups, fr_lang_lookups], lookups => lookups.CDN_URL = CDN_URL );


  const a11y_template = file_to_str("./src/InfoBase/index.hbs.html");
  const a11y_template_func = Handlebars.compile(a11y_template);

  return [
    {
      file_prefix: "index",
      en: template_func(en_lang_lookups),
      fr: template_func(fr_lang_lookups),
    },
    {
      file_prefix: "index-basic",
      en: a11y_template_func(_.assign({}, en_lang_lookups, { script_url: en_lang_lookups.a11y_script_url, other_lang_href: en_lang_lookups.a11y_other_lang_href, is_a11y_mode: true })),
      fr: a11y_template_func(_.assign({}, fr_lang_lookups, { script_url: fr_lang_lookups.a11y_script_url, other_lang_href: fr_lang_lookups.a11y_other_lang_href, is_a11y_mode: true })),
    },
  ];
}

function make_dir_if_exists(dir_name){
  if (!fse.existsSync(dir_name)){
    fse.mkdirSync(dir_name);
  }
};

function get_lookup_name(file_name){
  let str = file_name;
  _.each(['_en','_fr'], lang => {
    str = str.split(lang).join("");
  });
  return _.last(str.split('/'));
}

function build_proj(PROJ){
  
  const dir = 'build/'+PROJ.name
  const results_dir = `${dir}/results`;
  const footnotes_dir = `${dir}/footnotes`

  _.each(
    ['build', dir, results_dir, footnotes_dir], 
    name => {
      make_dir_if_exists(name)
    }
  )

  const bilingual_model_files = {
    depts: "igoc.csv",
    crsos: "crso.csv",
    tag_prog_links: "tags_to_programs.csv",
    programs: "program.csv",

    sub_programs: "subprograms.csv",
    results: "Results.csv",
    indicators: "Indicators.csv",
    PI_DR_links: "pi_dr_links.csv",

    footnotes: "footnotes.csv",
  };

  const parsed_bilingual_models = _.mapValues(bilingual_model_files, file_name => (
    d3_dsv.csvParse(
      _.trim(file_to_str(public_dir_prefixer(file_name)))
    )
  ));

  write_result_bundles(parsed_bilingual_models, results_dir);


  _.each(["en","fr"], lang => {


    const {
      depts: dept_footnotes,
      tags: tag_footnotes,
      global: global_footnotes,
      all: all_footnotes,
    } = get_footnote_file_defs(parsed_bilingual_models, lang);

    _.each( _.merge(dept_footnotes, tag_footnotes), (file_str,subj_id)=>{
      const uncompressed_file_name =`${footnotes_dir}/fn_${lang}_${subj_id}.html`;
      const compressed_file_name = `${footnotes_dir}/fn_${lang}_${subj_id}_min.html`;
      fs.writeFileSync(uncompressed_file_name, file_str);
      cp.execSync(`gzip -c ${uncompressed_file_name} > ${compressed_file_name}`);

    })

    const all_fn_uncompressed_url = `${footnotes_dir}/fn_${lang}_all.html`;
    const all_fn_compressed_url = `${footnotes_dir}/fn_${lang}_all_min.html`;
    fs.writeFileSync(all_fn_uncompressed_url,all_footnotes);
    cp.execSync(`gzip -c ${all_fn_uncompressed_url} > ${all_fn_compressed_url}`);

    // combine all the lookups into one big JSON blob
    // also, create a compressed version for modern browsers
    const lookup_json_str = JSON.stringify(
      _.chain(PROJ["lookups_"+lang])
        .map(file_name => [ get_lookup_name(file_name), file_to_str(file_name) ])
        .concat([['global_footnotes', global_footnotes]]) //these should be loaded immediately, so they're included in the base lookups file.
        .fromPairs()
        .value()
    )
      .toString("utf8");

    fs.writeFileSync(`${dir}/lookups_${lang}.html`,lookup_json_str);
    cp.execSync(`gzip -c ${dir}/lookups_${lang}.html > ${dir}/lookups_${lang}_min.html`);

  });

  fse.copySync('external-dependencies/GCWeb', dir+'/GCWeb', {clobber: true});
  fse.copySync('external-dependencies/img', dir+'/img', {clobber: true});
  fse.copySync('external-dependencies/wet-boew', dir+'/wet-boew', {clobber: true});
  fse.copySync('external-dependencies/cioscripts', dir+'/cioscripts', {clobber: true});
  fse.copySync('external-dependencies/ajax', dir+'/ajax', {clobber: true});
  //clobber overwrites old directory when copying
  ['png','js','csv'].forEach(function(type){
    var this_dir = dir+'/'+type;
    make_dir_if_exists(this_dir);
    PROJ[type].forEach(function(f_name){
      const small_name = f_name.split('/').pop(); // dir/file.js -> file.js

      console.log('copying:' + small_name);
      fse.copySync(f_name, this_dir+'/'+small_name, {clobber: true});
      if (type === "csv"){
        cp.execSync(`gzip -c ${dir}/csv/${small_name}> ${dir}/csv/${small_name}_min.html`);
      }
    });
  }); 
  PROJ.other.forEach(function(f_name){
    var small_name = f_name.split('/').pop();
    console.log('copying:' + small_name);
    fse.copySync(f_name, dir+'/'+small_name, {clobber:true});
  });
  _.each(get_index_pages(), ({file_prefix, en, fr }) => {
    fs.writeFileSync(
      `${dir}/${file_prefix}-eng.html`,
      en
    );
    fs.writeFileSync(
      `${dir}/${file_prefix}-fra.html`,
      fr
    );
  });

  console.log("\n done \n");
};


build_proj(IB);



