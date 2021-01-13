import _ from "lodash";
import marked from "marked";

import { is_mobile } from "src/core/feature_detection.js";

import { lang } from "src/core/injected_build_constants.js";

import d3 from "src/app_bootstrap/d3-bundle.js";

import a11y_lang from "../common_text/a11y_lang.yaml";
import common_lang from "../common_text/common_lang.yaml";
import estimates_lang from "../common_text/estimates_lang.yaml";
import igoc_lang from "../common_text/igoc-lang.yaml";
import nav_lang from "../common_text/nav_lang.yaml";
import people_lang from "../common_text/people_lang.yaml";
import result_lang from "../common_text/result_lang.yaml";
import template_globals_file from "../common_text/template_globals.csv";

/* 
  TODO: some parts of this still feel hacky 
    * Some of this logic should be done at compile time, so that modules can opt to use their own templates in special cases

  There are two core structures here, 
  one is the default set of text that will get passed to every template. 
  This is a key/val store with strings as values.
  All of this comes from a single lookups.yaml

  the 2nd structure is all the templates.
  * They come from various modules registering it through the add_text_bundle function this module exposes.
  * These are stored as key/val pairs, but the pairs are object, with the string (or compiled template function) stored on the text property
  * They are often defined with en/fr pairs in yaml, but we always map the correct language to the text property
  * this part makes use of the first part to pass the default template arguments 
*/

const global_bundles = [
  common_lang,
  igoc_lang,
  nav_lang,
  result_lang,
  people_lang,
  estimates_lang,
  a11y_lang,
];

//this will look like { key, en, fr }
const template_globals_parsed = d3.csvParse(template_globals_file);

const additionnal_globals = _.chain(template_globals_parsed)
  .filter(({ key }) => key.match(/year?.?.$/))
  .map(({ key, en, fr }) => {
    const short_year_first = fr.slice(0, 4);
    const short_year_second = fr.slice(5, 9);
    return [
      {
        key: key + "_short_first",
        en: short_year_first,
        fr: short_year_first,
      },
      {
        key: key + "_short_second",
        en: short_year_second,
        fr: short_year_second,
      },
      {
        key: key + "_end_ticks",
        en: "March 31st, " + short_year_second,
        fr: "31 mars " + short_year_second,
      },
    ];
  })
  .flatten()
  .value();

const full_template_global_records = [
  ...template_globals_parsed,
  ...additionnal_globals,
];

const app_constants = {
  lang: lang,
  is_mobile: is_mobile(),
};

//turn [{key,en,fr }, ... ] into a big object of { [key]: val of current lang, ... }
const template_globals = _.chain(full_template_global_records)
  .map(({ key, en, fr }) => [key, lang === "en" ? en : fr])
  .fromPairs()
  .extend(app_constants)
  .value();

//calls handlebars templates with standard args,
// plus any others passed
const run_template = function (s, extra_args = {}) {
  // 1. `s` is the (or array of) raw handlebars template
  // 2. `extra_args` are additional arguments for hbs context

  if (!_.isObject(extra_args)) {
    extra_args = {};
  }
  if (_.isArray(s)) {
    return _.map(s, function (__) {
      return run_template(__, extra_args);
    });
  }
  // build common arguments object which will be passed
  // to all templates
  const args = _.extend({}, extra_args, template_globals); //FIXME: extra_args should take precedence over template globals. Don't have time to test this right now.
  // combine the `extra_args` with the common arguments
  if (s) {
    let _template;
    if (_.isString(s)) {
      _template = Handlebars.compile(_.trim(s));
    } else {
      //it's a function -> already compiled
      _template = s;
    }
    return _.trim(_template(args));
  }
  return "";
};

//above this point is the first part: default template arguments
//below is the second part: templates

Handlebars._partials = {};
const template_store = {};

/*@param text_bundle 
  text_bundle is a key/val store of objects of the form {
  transforms: Array,
  en and fr OR text : strings (which might be hbs + markdown templates)
  } 
  OR {
    precompile: bool,  text: hbs as string 
  }
  OR {
    handlebars_partial: bool, text : hbs as string
  }
  
  this function will get rid of all en/fr and replace it with text 

*/
const text_bundles_by_filename = {};
const add_text_bundle = (text_bundle) => {
  const { __file_name__ } = text_bundle;
  const to_add = {};
  _.each(_.omit(text_bundle, "__file_name__"), (text_obj, key) => {
    if (text_obj.handlebars_partial) {
      Handlebars.registerPartial(key, text_obj.text);
      return;
    }

    //partials are the only case we don't add to the global text registry
    to_add[key] = text_obj;

    //get rid of language specific props
    text_obj.text = text_obj[lang] || text_obj.text;
    delete text_obj.en;
    delete text_obj.fr;

    if (text_obj.pre_compile === true) {
      const hbs_content = text_obj[lang] || text_obj.text;
      text_obj.text = Handlebars.compile(hbs_content);
      text_obj.handlebars_compiled = true;
    }
  });
  _.extend(template_store, to_add);

  text_bundles_by_filename[__file_name__] = to_add;
};

const combine_bundles = (bundles) => {
  return _.chain(bundles)
    .map((bundle) => {
      const { __file_name__ } = bundle;
      if (!_.has(text_bundles_by_filename, __file_name__)) {
        add_text_bundle(bundle);
      }
      return _.toPairs(text_bundles_by_filename[__file_name__]);
    })
    .flatten()
    .fromPairs()
    .value();
};

const combined_global_bundle = combine_bundles(global_bundles);

const _create_text_maker = (deps = template_store) => (key, context = {}) => {
  // 1. lookup the key to get the text object
  // 2. note that by the time this function gets called, we've already stripped out language
  // 3. loop over the transform attribute on the text object
  //    and apply the requested transform i.e. handlebars
  //    and markdown
  if (!_.isObject(context)) {
    context = {};
  }
  if (deps.__text_maker_func__) {
    context.__text_maker_func__ = deps.__text_maker_func__;
  } else {
    context.__text_maker_func__ = trivial_text_maker; /* eslint-disable-line no-use-before-define */
  }

  const text_obj = deps[key];

  if (_.isUndefined(text_obj)) {
    throw `ERROR: undefined text_maker key "${key}"`;
  }

  if (_.isString(text_obj)) {
    return text_obj;
  }

  let rtn = text_obj.text;
  _.each(text_obj.transform, (transform) => {
    if (transform === "handlebars") {
      if (!text_obj.handlebars_compiled) {
        text_obj.text = Handlebars.compile(rtn);
        text_obj.handlebars_compiled = true;
      }
      rtn = run_template(rtn, context);
    } else if (transform === "markdown") {
      rtn = marked(rtn, { sanitize: false, gfm: true });
    } else if (transform === "embeded-markdown") {
      const temp_dom_node = document.createElement("div");

      temp_dom_node.innerHTML = rtn;

      const embedded_markdown_nodes = temp_dom_node.querySelectorAll(
        ".embeded-markdown"
      );

      if (embedded_markdown_nodes.length) {
        _.map(embedded_markdown_nodes, _.idenity).forEach(
          (node) =>
            (node.innerHTML = marked(node.innerHTML, {
              sanitize: false,
              gfm: true,
            }))
        );
      }

      rtn = temp_dom_node.innerHTML;
    }
  });
  if (_.has(text_obj, "outside_html")) {
    rtn = Handlebars.compile(text_obj.outside_html)({
      content: rtn,
    });
  }
  return rtn;
};

const create_text_maker = (bundles) => {
  if (_.isEmpty(bundles)) {
    //called without args -> only global text
    return trivial_text_maker; /* eslint-disable-line no-use-before-define */
  }
  if (!_.isArray(bundles)) {
    //single el
    bundles = [bundles];
  }

  const combined = combine_bundles(bundles);
  _.extend(combined, combined_global_bundle);
  const func = _create_text_maker(combined);
  combined.__text_maker_func__ = func;

  return func;
};

const trivial_text_maker = _create_text_maker(combined_global_bundle);

window._DEV_HELPERS.trivial_text_maker = trivial_text_maker;
window._DEV_HELPERS.run_template = run_template;
window._DEV_HELPERS.template_store = template_store;
window._DEV_HELPERS.template_globlals = template_globals;
window._DEV_HELPERS.create_text_maker = create_text_maker;

export { run_template, template_store, create_text_maker, trivial_text_maker };
