import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import Handlebars from "handlebars/dist/cjs/handlebars";
import _ from "lodash";
import { marked } from "marked";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";
import { is_mobile } from "src/core/feature_detection";
import { lang } from "src/core/injected_build_constants";

import a11y_lang from "src/common_text/a11y_lang.yaml";
import common_lang from "src/common_text/common_lang.yaml";
import estimates_lang from "src/common_text/estimates_lang.yaml";
import igoc_lang from "src/common_text/igoc-lang.yaml";
import nav_lang from "src/common_text/nav_lang.yaml";
import people_lang from "src/common_text/people_lang.yaml";
import result_lang from "src/common_text/result_lang.yaml";
import template_globals from "src/common_text/template_globals.yaml";

// Handlebars disabled protype access within templates (i.e. can't access parent properties on an object within a template) for security reasons,
// but those concerns are really for server side use cases where an attacker can provide an arbitrary template. For our client side use case,
// an attacker would already need code injection to provide an arbitrary template
// Disabling prototype access in text_maker breaks a _lot_ of code. Theoretically could refactor to lift any prototype accessing up to the caller level,
// only pass in direct arguments to templates, but it'd be a _lot_ of work and persist as an annoying gotcha rule for future devs
export const HandlebarsWithPrototypeAccess =
  allowInsecurePrototypeAccess(Handlebars);

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

const unwrapped_template_globals = _.mapValues(
  template_globals,
  (lang_wrapped) => lang_wrapped[lang]
);

const derived_year_template_globals = _.chain(unwrapped_template_globals)
  .omitBy((_value, key) => !_.includes(key, "year"))
  .flatMap((value, key) => {
    const { short_year_first, short_year_second } = (() => {
      if (_.includes(key, "ppl")) {
        const short_year_second = value.slice(-4);
        const short_year_first = _.chain(short_year_second)
          .thru((second_year) => +second_year - 1)
          .toString()
          .value();

        return { short_year_first, short_year_second };
      } else {
        const short_year_first = value.slice(0, 4);
        const short_year_second = _.chain(short_year_first)
          .thru((first_year) => +first_year + 1)
          .toString()
          .value();

        return { short_year_first, short_year_second };
      }
    })();

    return [
      [key + "_short_first", short_year_first],
      [key + "_short_second", short_year_second],
      [
        key + "_end_ticks",
        `${lang === "en" ? "March 31st," : "31 mars"} ${short_year_second}`,
      ],
    ];
  })
  .fromPairs()
  .value();

const full_template_globals = {
  ...unwrapped_template_globals,
  ...derived_year_template_globals,
  ...{
    lang: lang,
    is_mobile: is_mobile(),
  },
};

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
  const args = _.extend({}, extra_args, full_template_globals); //FIXME: extra_args should take precedence over template globals. Don't have time to test this right now.
  // combine the `extra_args` with the common arguments
  if (s) {
    let _template;
    if (_.isString(s)) {
      _template = HandlebarsWithPrototypeAccess.compile(_.trim(s));
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
  _.forEach(_.omit(text_bundle, "__file_name__"), (text_obj, key) => {
    if (text_obj.handlebars_partial) {
      HandlebarsWithPrototypeAccess.registerPartial(key, text_obj.text);
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
      text_obj.text = HandlebarsWithPrototypeAccess.compile(hbs_content);
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

const _create_text_maker =
  (deps = template_store) =>
  (key, context = {}) => {
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
      context.__text_maker_func__ =
        trivial_text_maker; /* eslint-disable-line no-use-before-define */
    }

    const text_obj = deps[key];

    if (_.isUndefined(text_obj)) {
      throw new Error(`undefined text_maker key "${key}"`);
    }

    if (_.isString(text_obj)) {
      return text_obj;
    }

    let rtn = text_obj.text;
    _.forEach(text_obj.transform, (transform) => {
      if (transform === "handlebars") {
        if (!text_obj.handlebars_compiled) {
          text_obj.text = HandlebarsWithPrototypeAccess.compile(rtn);
          text_obj.handlebars_compiled = true;
        }
        rtn = run_template(rtn, context);
      } else if (transform === "markdown") {
        rtn = marked(rtn, { sanitize: false, gfm: true });
      } else if (transform === "embeded-markdown") {
        const temp_dom_node = document.createElement("div");

        temp_dom_node.innerHTML = rtn;

        const embedded_markdown_nodes =
          temp_dom_node.querySelectorAll(".embeded-markdown");

        if (embedded_markdown_nodes.length) {
          _.map(embedded_markdown_nodes, _.identity).forEach(
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
      rtn = HandlebarsWithPrototypeAccess.compile(text_obj.outside_html)({
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

assign_to_dev_helper_namespace({
  text: {
    trivial_text_maker,
    run_template,
    template_store,
    template_globals,
    create_text_maker,
  },
});

export { run_template, template_store, create_text_maker, trivial_text_maker };
