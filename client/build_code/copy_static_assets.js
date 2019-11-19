/* eslint-disable no-console */

//fse just adds the ability to do 'cp -r' to the regular filesystem tools for node
const fse = require('fs-extra');
const fs = require("fs");
const _ = require("lodash");
const Handlebars = require('handlebars');
const d3_dsv = require('d3-dsv');
const gitsha = require('git-bundle-sha');

global._ = _; //global is the 'window' on the node environment

const { get_footnote_file_defs } = require('./write_footnote_bundles.js');
const { bundle_extended_bootstrap_css } = require('./bundle_extended_bootstrap_css.js');
const { index_lang_lookups } = require("../src/InfoBase/index_data.js");

const build_dir_name = process.env.BUILD_DIR || "build";

/*
This copies stuff into the build directory

webpack makes it easier to handle yaml and css, 
the most complicated parts, so being less data-driven is 
actually simpler now.

PROJ -> {
  (mkdir if doesn't exist) build/, build/PROJ.name/, js/ , csv/ , svg/
  copy other to build/PROJ.name (this is where index-en/fr get copied)
  forEach file in PROJ.spreadsheets, copy it to to build/PROJ.name/csv/
  copy entire svg directory, src/svg, to build/PROJ.name/svg
}
*/
const public_data_dir = "../data/";

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
    'dept_code_to_csv_name.csv',
    'org_to_minister.csv',
    'ministers.csv',
    'ministries.csv',
    'inst_forms.csv',
    'url_lookups.csv',

    'glossary.csv',
  ], 
  public_dir_prefixer 
);


//these files are big and are explicitly split by the pipeline (bilingual bundles are also used elsewhere, though) 
const lang_specific_lookups = lang => [
  "program",
  "crso",
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

const svg_path = 'src/svg';

const png_path = 'src/png';

const table_csvs = _.map(
  [
    'org_employee_age_group',
    'org_employee_avg_age',
    'org_employee_ex_lvl',
    'org_employee_fol',
    'org_employee_gender',
    'org_employee_region',
    'org_employee_type',
    'org_sobjs',
    'org_sobjs_qfr',
    'org_transfer_payments',
    'org_transfer_payments_region',
    'org_vote_stat_estimates',
    'org_vote_stat_pa',
    'org_vote_stat_qfr',
    'program_ftes',
    'program_sobjs',
    'program_spending',
    'program_vote_stat', 
  ],
  name => public_dir_prefixer(`${name}.csv`)
);

const other_csv_names_unilingual = [];
const other_csv_names_bilingual = _.flatMap(
  [
    "hi_lookups",
  ],
  (name) => [`${name}_en.csv`, `${name}_fr.csv`] 
);
const other_csvs = _.map(
  [
    ...other_csv_names_unilingual,
    ...other_csv_names_bilingual,
  ],
  public_dir_prefixer
);

var IB = {
  name: 'InfoBase',
  lookups_en: common_lookups.concat(common_lookups_en),
  lookups_fr: common_lookups.concat(common_lookups_fr),
  svg: svg_path,
  png: png_path,
  csv: table_csvs.concat(other_csvs),
  well_known: ['src/InfoBase/security.txt'],
  other: [
    'src/robots/robots.txt',
    'src/InfoBase/favicon.ico',
  ],
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
  
  const get_extended_a11y_args = (lang_lookups) => ({
    ...lang_lookups,
    script_url: lang_lookups.a11y_script_url, 
    other_lang_href: lang_lookups.a11y_other_lang_href,
    is_a11y_mode: true,
  });

  return [
    {
      file_prefix: "index",
      en: template_func(en_lang_lookups),
      fr: template_func(fr_lang_lookups),
    },
    {
      file_prefix: "index-basic",
      en: a11y_template_func( get_extended_a11y_args(en_lang_lookups) ),
      fr: a11y_template_func( get_extended_a11y_args(fr_lang_lookups) ),
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

function write_gitsha_file(dir){
  gitsha(function(err, sha){
    fs.writeFileSync(`${dir}/build_sha`, sha);
  });
}

function build_proj(PROJ){
  
  const dir = `${build_dir_name}/InfoBase`;
  const app_dir = `${dir}/app`;
  const footnotes_dir = `${dir}/footnotes`;
  const well_known_dir = `${dir}/.well-known`;

  _.each(
    [build_dir_name, dir, app_dir, footnotes_dir], 
    name => make_dir_if_exists(name)
  );

  const bilingual_model_files = {
    depts: "igoc.csv",
    crsos: "crso.csv",
    tag_prog_links: "tags_to_programs.csv",
    programs: "program.csv",

    footnotes: "footnotes.csv",
  };

  const parsed_bilingual_models = _.mapValues(bilingual_model_files, file_name => (
    d3_dsv.csvParse(
      _.trim(file_to_str(public_dir_prefixer(file_name)))
    )
  ));

  write_gitsha_file(dir);

  _.each(["en", "fr"], lang => {

    const {
      depts: dept_footnotes,
      tags: tag_footnotes,
      global: global_footnotes,
      all: all_footnotes,
      estimates: estimate_footnotes,
    } = get_footnote_file_defs(parsed_bilingual_models, lang);

    _.each( _.merge(dept_footnotes, tag_footnotes), (file_str, subj_id) => {
      // reminder: the funky .json.js exstension is to ensure that Cloudflare caches these, as it usually won't cache .json
      fs.writeFileSync(
        `${footnotes_dir}/fn_${lang}_${subj_id}.json.js`,
        file_str
      );
    });

    fs.writeFileSync(
      `${footnotes_dir}/fn_${lang}_all.json.js`,
      all_footnotes
    );

    const est_fn_url = `${footnotes_dir}/fn_${lang}_estimates.json.js`;
    fs.writeFileSync(est_fn_url, estimate_footnotes);

    // combine all the lookups into one big JSON blob
    // also, create a compressed version for modern browsers
    const lookup_json_str = JSON.stringify(
      _.chain(PROJ["lookups_"+lang])
        .map(file_name => [ get_lookup_name(file_name), file_to_str(file_name) ])
        .concat([['global_footnotes', global_footnotes]]) //these should be loaded immediately, so they're included in the base lookups file.
        .fromPairs()
        .value()
    ).toString("utf8");

    fs.writeFileSync(`${dir}/lookups_${lang}.json.js`,lookup_json_str);

  });

  const copy_file_to_target_dir = (file_name, target_dir) => {
    const small_name = file_name.split('/').pop(); // dir/file.js -> file.js
    console.log('copying:' + small_name);
    fse.copySync(file_name, target_dir+'/'+small_name, {clobber: true});//clobber overwrites old directory when copying
  };

  copy_file_to_target_dir(svg_path, dir);
  copy_file_to_target_dir(png_path, dir);

  ['csv'].forEach(function(type){
    var this_dir = dir+'/'+type;
    make_dir_if_exists(this_dir);
    PROJ[type].forEach( f_name => copy_file_to_target_dir(f_name, this_dir) );
  });
  PROJ.well_known.forEach( f_name => copy_file_to_target_dir(f_name, well_known_dir) );
  PROJ.other.forEach( f_name => copy_file_to_target_dir(f_name, dir) );

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

  console.log("\n done copying static assets \n");

  console.log("\n bundling extended bootstrap css... \n");
  bundle_extended_bootstrap_css(app_dir);
};


build_proj(IB);



