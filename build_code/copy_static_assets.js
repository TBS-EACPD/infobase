//glob.sync takes a pattern and returns an array of  filenames matching that pattern
//fse just adds the ability to do 'cp -r' to the regular filesystem tools for node
const glob = require('glob');
const fse = require('fs-extra');
const fs = require("fs");
const cp = require("child_process");
const _ = require("lodash");

global._ = _; //global is the 'window' on the node environment

const { write_result_bundles } = require('./write_result_bundles.js');
const { get_footnote_file_defs } = require('./write_footnote_bundles.js');

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

const common_lookups = _.map(
  [
    'tags_m2m_programs.csv',
    'program_tags.csv',
    'program_tag_types.csv',
    'DeptcodetoTableID.csv',
    'OrgtoMinister.csv',
  ], 
  public_dir_prefixer 
);

const common_result_bundle_en = _.map(
  [
    'Indicator_en.csv',
    'Results_en.csv',
    'Subprogram_en.csv',
    'PIDRLink.csv',
  ],
  public_dir_prefixer
);

const common_result_bundle_fr = _.map(
  [
    'Indicator_fr.csv',
    'Results_fr.csv',
    'Subprogram_fr.csv',
    'PIDRLink.csv',
  ],
  public_dir_prefixer
);

const common_lookups_en = _.map(
  [
    'program_en.csv',
    'CRSODefinition_en.csv',
    'Glossary_en.csv',
    'InstForm_en.csv',
    'Minister_en.csv',
    'Ministry_en.csv',
    'URL_en.csv',
    'IGOC_en.csv',
  ],
  public_dir_prefixer
);

const common_lookups_fr = _.map(
  [
    'program_fr.csv',
    'CRSODefinition_fr.csv',
    'Glossary_fr.csv',
    'InstForm_fr.csv',
    'Minister_fr.csv',
    'Ministry_fr.csv',
    'URL_fr.csv',
    'IGOC_fr.csv',
  ],
  public_dir_prefixer
);

const common_png = [

  'src/home/partition.svg',
  'src/home/partition.png',

  'src/home/structurePanel.svg',
  'src/home/structure_panel.png',

  'src/home/results.svg',
  'src/home/results.png',

  'src/home/expend.svg',
  'src/home/expend.png',

  'src/home/people.svg',
  'src/home/people.png',

  'src/home/bubbles.png',
  'src/home/bubbles.png',

  'src/home/Builder.svg',
  'src/home/Builder.png',

  'src/home/explorerVer2.svg',
  'src/home/explorer.png',

  'src/graphs/intro_graphs/Check.svg',
  'src/graphs/intro_graphs/Graph.svg',
  'src/graphs/intro_graphs/Money.svg',
  'src/graphs/intro_graphs/People.svg',
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
  //'table111', // waiting on data
  //'table112',
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
  result_bundle_en: common_result_bundle_en,
  result_bundle_fr: common_result_bundle_fr,
  csv: csv_from_table_names(IB_tables),
  png: common_png,
  js: external_deps_names,
  other: [ 'src/robots/robots.txt','src/InfoBase/index-eng.html', 'src/InfoBase/index-fra.html'],
};

function make_dir_if_exists(dir_name){
  if (!fse.existsSync(dir_name)){
    fse.mkdirSync(dir_name);
  }
};

var project = IB;

function get_lookup_name(file_name){
  let str = file_name;
  _.each(['_en','_fr'], lang => {
    str = str.split(lang).join("");
  })
  return _.last(str.split('/'));
}

var build_proj = function(PROJ){
  
  const dir = 'build/'+PROJ.name
  const results_dir = `${dir}/results`;
  const footnotes_dir = `${dir}/footnotes`

  make_dir_if_exists('build');
  make_dir_if_exists(dir);
  make_dir_if_exists(results_dir);
  make_dir_if_exists(footnotes_dir);

  _.each(["en","fr"], lang => {

    const files_obj = _.chain({
      depts: `IGOC_${lang}.csv`,
      crsos: `CRSODefinition_${lang}.csv`,
      tag_prog_links: 'tags_m2m_programs.csv',
      programs: `program_${lang}.csv`,

      sub_programs: `Subprogram_${lang}.csv`,
      results: `Results_${lang}.csv`,
      indicators: `Indicator_${lang}.csv`,
      PI_DR_links: 'PIDRLink.csv',

      footnotes: `footnotes_${lang}.csv`,
    })
      .mapValues( file_name => fs.readFileSync(public_dir_prefixer(file_name)).toString('utf8') )
      .value();
      
    write_result_bundles(files_obj, results_dir, lang );

    const {
      depts: dept_footnotes,
      tags: tag_footnotes,
      global: global_footnotes,
      all: all_footnotes,
    } = get_footnote_file_defs(files_obj);

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
    const lookup_json_str = JSON.stringify(_.chain(PROJ["lookups_"+lang])
      .map(file_name => [get_lookup_name(file_name), fs.readFileSync(file_name).toString("utf8")])
      .concat([['global_footnotes', global_footnotes]]) //these should be loaded immediately, so they're included in the base lookups file.
      .fromPairs()
      .value())
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
  console.log("\n done \n");
};


build_proj(project);



