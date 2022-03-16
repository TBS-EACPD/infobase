import _ from "lodash";

import React from "react";
import ReactDOMServer from "react-dom/server.browser";

import { glossaryEntryStore } from "src/models/glossary";

import { Dept } from "src/models/subjects";
import {
  HandlebarsWithPrototypeAccess,
  trivial_text_maker,
  run_template,
} from "src/models/text";

import { formats, array_to_grammatical_list } from "src/core/format";
import { lang } from "src/core/injected_build_constants";

import { IconQuestion } from "src/icons/icons";

import { infographic_href_template, glossary_href } from "src/link_utils";

_.each(formats, (format, key) => {
  HandlebarsWithPrototypeAccess.registerHelper(
    "fmt_" + key,
    (amount) => new HandlebarsWithPrototypeAccess.SafeString(format(amount))
  );
});
HandlebarsWithPrototypeAccess.registerHelper(
  "fmt_array_to_grammatical_list",
  (array) =>
    new HandlebarsWithPrototypeAccess.SafeString(
      array_to_grammatical_list(array)
    )
);

const change_map = {
  past: {
    to: {
      en: {
        increase: "increased to",
        decrease: "decreased to",
        constant: "remained unchanged",
      },
      fr: {
        increase: {
          ms: "a atteint",
          mp: "ont atteint",
          fs: "a atteint",
          fp: "ont atteint",
        },
        decrease: {
          ms: "a diminué jusqu'à",
          mp: "ont diminué jusqu'à",
          fs: "a diminuée jusqu'à",
          fp: "ont diminué jusqu'à",
        },
        constant: {
          ms: "est demeuré constant",
          mp: "sont demeurés constants",
          fs: "est demeurée constante",
          fp: "sont demeurées constantes",
        },
      },
    },
    by: {
      en: {
        increase: "increased by",
        decrease: "decreased by",
        constant: "remained unchanged",
      },
      fr: {
        increase: {
          ms: "a augmenté de ",
          mp: "ont affiché une hausse de ",
          fs: "a augmenté de ",
          fp: "ont affiché une hausse de ",
        },
        decrease: {
          ms: "a diminué de ",
          mp: "ont diminué de ",
          fs: "a diminué de ",
          fp: "ont diminué de ",
        },
        constant: {
          ms: "est demeuré constant",
          mp: "sont demeurés constants",
          fs: "est demeurée constante",
          fp: "sont demeurées constantes",
        },
      },
    },
    ing: {
      en: {
        increase: "an increase of",
        decrease: "a decrease of",
        constant: "remaining unchanged",
      },
      fr: {
        increase: {
          ms: "une hausse de ",
          mp: "ont affiché une hausse de ",
          fs: "une hausse de ",
          fp: "ont affiché une hausse de ",
        },
        decrease: {
          ms: "une baisse de ",
          mp: "ont affiché une baisse de ",
          fs: "une baisse de ",
          fp: "ont affiché une baisse de ",
        },
        constant: {
          ms: "est demeuré constant",
          mp: "sont demeurés constants",
          fs: "est demeurée constante",
          fp: "sont demeurées constantes",
        },
      },
    },
  },
  future: {
    to: {
      en: {
        increase: "planned to increase to",
        decrease: "planned to decrease to",
        constant: "planned to remain unchanged",
      },
      fr: {
        increase: {
          s: "va atteindre",
          p: "vont atteindre",
        },
        decrease: {
          s: "va diminuer jusqu'à",
          p: "vont diminuer jusqu'à",
        },
        constant: {
          ms: "va demeurer constant",
          fs: "va demeurer constante",
          mp: "vont demeurer constants",
          fp: "vont demeurer constantes",
        },
      },
    },
    by: {
      en: {
        increase: "planned to increase by",
        decrease: "planned to decrease by",
        constant: "planned to remain unchanged",
      },
      fr: {
        increase: {
          s: "va augmenter de",
          p: "vont augmenter de",
        },
        decrease: {
          s: "va diminuer de",
          p: "vont diminuer de",
        },
        constant: {
          ms: "va demeurer constant",
          fs: "va demeurer constante",
          mp: "vont demeurer constants",
          fp: "vont demeurer constantes",
        },
      },
    },
  },
};
// a series of [handlebars.js](http://handlebarsjs.com/)
// [helpers](http://handlebarsjs.com/#helpers)
//

const calc_direction = function (val) {
  return val === 0 ? "constant" : val > 0 ? "increase" : "decrease";
};
const en_master_change = function (val, formatter, preposition, tense) {
  const direction = calc_direction(val);
  let return_value = change_map[tense][preposition]["en"][direction];
  if (direction !== "constant" && formatter.length > 0) {
    return_value +=
      " " + HandlebarsWithPrototypeAccess.helpers[formatter](Math.abs(val));
  }
  return new HandlebarsWithPrototypeAccess.SafeString(return_value);
};
const fr_master_change = function (
  val,
  formatter,
  preposition,
  temps,
  genre,
  nombre
) {
  const direction = calc_direction(val);
  if (temps === "future" && direction !== "constant") {
    genre = "";
  }
  let return_value =
    change_map[temps][preposition]["fr"][direction][genre + nombre];
  if (direction !== "constant" && formatter.length > 0) {
    return_value +=
      " " + HandlebarsWithPrototypeAccess.helpers[formatter](Math.abs(val));
  }
  return new HandlebarsWithPrototypeAccess.SafeString(return_value);
};
HandlebarsWithPrototypeAccess.registerHelper(
  "changed_to",
  function (val, formatter) {
    return en_master_change(val, formatter, "to", "past");
  }
);
HandlebarsWithPrototypeAccess.registerHelper(
  "changed_by",
  function (val, formatter) {
    return en_master_change(val, formatter, "by", "past");
  }
);
// Dom code:
HandlebarsWithPrototypeAccess.registerHelper(
  "changing_by",
  function (val, formatter) {
    return en_master_change(val, formatter, "ing", "past");
  }
);

HandlebarsWithPrototypeAccess.registerHelper(
  "will_change_to",
  function (val, formatter) {
    return en_master_change(val, formatter, "to", "future");
  }
);
HandlebarsWithPrototypeAccess.registerHelper(
  "will_change_by",
  function (val, formatter) {
    return en_master_change(val, formatter, "by", "future");
  }
);
HandlebarsWithPrototypeAccess.registerHelper(
  "fr_changed_to",
  function (val, genre, nombre, formatter) {
    return fr_master_change(val, formatter, "to", "past", genre, nombre);
  }
);
HandlebarsWithPrototypeAccess.registerHelper(
  "fr_changed_by",
  function (val, genre, nombre, formatter) {
    return fr_master_change(val, formatter, "by", "past", genre, nombre);
  }
);
// Dom code:
HandlebarsWithPrototypeAccess.registerHelper(
  "fr_changing_by",
  function (val, genre, nombre, formatter) {
    return fr_master_change(val, formatter, "ing", "past", genre, nombre);
  }
);
HandlebarsWithPrototypeAccess.registerHelper(
  "fr_will_change_by",
  function (val, genre, nombre, formatter) {
    return fr_master_change(val, formatter, "by", "future", genre, nombre);
  }
);
HandlebarsWithPrototypeAccess.registerHelper(
  "fr_will_change_to",
  function (val, genre, nombre, formatter) {
    return fr_master_change(val, formatter, "to", "future", genre, nombre);
  }
);

// Two value change helpers (Ex. "increased/decreased from val1 to val2")
const two_value_change_map = {
  past: {
    to: {
      en: {
        increase: ["increased from", "to"],
        decrease: ["decreased from", "to"],
        constant: "remained unchanged at",
      },
      fr: {
        increase: {
          ms: ["a augmenté de", "à"],
          mp: ["ont augmenté de", "à"],
          fs: ["a augmenté de", "à"],
          fp: ["ont augmenté de", "à"],
        },
        decrease: {
          ms: ["a diminué de", "à"],
          mp: ["ont diminué de", "à"],
          fs: ["a diminuée de", "à"],
          fp: ["ont diminué de", "à"],
        },
        constant: {
          ms: "est demeuré constant",
          mp: "sont demeurés constants",
          fs: "est demeurée constante",
          fp: "sont demeurées constantes",
        },
      },
    },
  },
};

const two_value_calc_direction = function (val1, val2, formatter) {
  // Compare with formatting for equality, as formatting may effectively round two numbers TO equality
  // Don't format for lesser than test, as formatting may mess that up
  return HandlebarsWithPrototypeAccess.helpers[formatter](val1).string ===
    HandlebarsWithPrototypeAccess.helpers[formatter](val2).string
    ? "constant"
    : val1 < val2
    ? "increase"
    : "decrease";
};
const en_master_two_value_change = function (
  val1,
  val2,
  formatter,
  preposition,
  tense
) {
  let return_value = "INVALID FORMATTER"; // Will only be returned if passed formatter invalid
  if (formatter.length > 0) {
    const direction = two_value_calc_direction(val1, val2, formatter);
    const two_value_change_text_components =
      two_value_change_map[tense][preposition]["en"][direction];
    if (direction !== "constant") {
      return_value =
        two_value_change_text_components[0] +
        " " +
        HandlebarsWithPrototypeAccess.helpers[formatter](val1) +
        " " +
        two_value_change_text_components[1] +
        " " +
        HandlebarsWithPrototypeAccess.helpers[formatter](val2);
    } else {
      return_value =
        two_value_change_text_components +
        " " +
        HandlebarsWithPrototypeAccess.helpers[formatter](val1);
    }
  }
  return new HandlebarsWithPrototypeAccess.SafeString(return_value);
};
const fr_master_two_value_change = function (
  val1,
  val2,
  formatter,
  preposition,
  temps,
  genre,
  nombre
) {
  let return_value = "INVALID FORMATTER"; // Will only be returned if passed formatter is invalid
  if (formatter.length > 0) {
    const direction = two_value_calc_direction(val1, val2, formatter);
    const two_value_change_text_components =
      two_value_change_map[temps][preposition]["fr"][direction][genre + nombre];
    if (direction !== "constant") {
      return_value =
        two_value_change_text_components[0] +
        " " +
        HandlebarsWithPrototypeAccess.helpers[formatter](val1) +
        " " +
        two_value_change_text_components[1] +
        " " +
        HandlebarsWithPrototypeAccess.helpers[formatter](val2);
    } else {
      return_value =
        two_value_change_text_components +
        " " +
        HandlebarsWithPrototypeAccess.helpers[formatter](val1);
    }
  }
  return new HandlebarsWithPrototypeAccess.SafeString(return_value);
};
HandlebarsWithPrototypeAccess.registerHelper(
  "two_value_changed_to",
  function (val1, val2, formatter) {
    return en_master_two_value_change(val1, val2, formatter, "to", "past");
  }
);
HandlebarsWithPrototypeAccess.registerHelper(
  "fr_two_value_changed_to",
  function (val1, val2, genre, nombre, formatter) {
    return fr_master_two_value_change(
      val1,
      val2,
      formatter,
      "to",
      "past",
      genre,
      nombre
    );
  }
);

// Helper to expand positive negative values to "[+/-]abs(value)"
HandlebarsWithPrototypeAccess.registerHelper(
  "plus_or_minus_val",
  function (val, formatter) {
    return (
      (val >= 0 ? "+" : "-") +
      HandlebarsWithPrototypeAccess.helpers[formatter](Math.abs(val))
    );
  }
);

// {{gt "key"}} -> looks up the key and returns
// the correct language
HandlebarsWithPrototypeAccess.registerHelper(
  "gt",
  function (context, other_arg) {
    //handlebars will change the "this" if a helper is called within an #each block
    if (!_.isFunction(this.__text_maker_func__)) {
      return other_arg.data.root.__text_maker_func__(
        context,
        other_arg.data.root
      );
    }
    return this.__text_maker_func__(context, this);
  }
);

// {{rt "key"}} -> runs template
HandlebarsWithPrototypeAccess.registerHelper("rt", function (context) {
  return run_template(context, this);
});

// taken from [this recipe](http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/)
HandlebarsWithPrototypeAccess.registerHelper(
  "isEqual",
  function (lvalue, rvalue, options) {
    if (lvalue === rvalue) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
);

// taken from [this recipe](http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/)
HandlebarsWithPrototypeAccess.registerHelper(
  "compare",
  function (lvalue, rvalue, options) {
    lvalue = +lvalue.toString();
    rvalue = +rvalue.toString();

    if (arguments.length < 3) {
      throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    var operator = options.hash.operator || "==";

    var operators = {
      "==": function (l, r) {
        return l === r;
      },
      "===": function (l, r) {
        return l === r;
      },
      "!=": function (l, r) {
        return l !== r;
      },
      "<": function (l, r) {
        return l < r;
      },
      ">": function (l, r) {
        return l > r;
      },
      "<=": function (l, r) {
        return l <= r;
      },
      ">=": function (l, r) {
        return l >= r;
      },
    };

    if (!operators[operator]) {
      throw new Error(
        "Handlerbars Helper 'compare' doesn't know the operator " + operator
      );
    }

    var result = operators[operator](lvalue, rvalue);

    if (result) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
);

// {{lang obj.some_property}} assumes
// ```
//   obj.some_property = {
//     en : "english text",
//     fr : "franch text",
//   }
//
//   and looks up the property corresponding to the
//   current language
//  ```
HandlebarsWithPrototypeAccess.registerHelper("lang", function (context) {
  if (context && _.has(context, lang)) {
    return context[lang];
  } else if (context.text) {
    return context.text;
  } else {
    return "";
  }
});

HandlebarsWithPrototypeAccess.registerHelper("ce_crso", (crso) => {
  if (crso.is_cr) {
    return `cette ${trivial_text_maker("core_resp")}`;
  } else {
    return `ce ${trivial_text_maker("strategic_outcome")}`;
  }
});

HandlebarsWithPrototypeAccess.registerHelper("le_crso", (crso) => {
  if (crso.is_cr) {
    return `la ${trivial_text_maker("core_resp")}`;
  } else {
    return `le ${trivial_text_maker("strategic_outcome")}`;
  }
});

HandlebarsWithPrototypeAccess.registerHelper("du_crso", (crso) => {
  if (crso.is_cr) {
    return `de la ${trivial_text_maker("core_resp")}`;
  } else {
    return `du ${trivial_text_maker("strategic_outcome")}`;
  }
});

const add_article_to_dept_identifier = (
  article_key,
  identifier_key,
  helper_context
) => {
  const dept_subject =
    helper_context.subject_type === "dept"
      ? helper_context
      : Dept.store.lookup(helper_context);

  const article = dept_subject[article_key];

  const article_is_full_word = !_.isEmpty(article) && _.last(article) !== "'";
  const article_identifier_separator = article_is_full_word ? " " : "";

  const identifier = dept_subject[identifier_key];

  return `${article}${article_identifier_separator}${identifier}`;
};

// looks up the name for the department if passed
// a department object
HandlebarsWithPrototypeAccess.registerHelper("de_dept", (context) =>
  add_article_to_dept_identifier("du_de_la", "name", context)
);
HandlebarsWithPrototypeAccess.registerHelper("de_dept_abbr", (context) =>
  add_article_to_dept_identifier("du_de_la", "abbr", context)
);
HandlebarsWithPrototypeAccess.registerHelper("le_dept", (context) =>
  add_article_to_dept_identifier("le_la", "name", context)
);
HandlebarsWithPrototypeAccess.registerHelper("le_dept_abbr", (context) =>
  add_article_to_dept_identifier("le_la", "abbr", context)
);

// {{encodeURI "someurl"}} -> encodes the string with URL
// encoding, i.e. "blah blah" -> "blah%20blah"
//
// or
// {{encodeURI obj}}, assumes:
// ```
//   obj = {
//     en : "someurl"
//     fr : "som`eurl"
//   }
// ```
HandlebarsWithPrototypeAccess.registerHelper("encodeURI", function (context) {
  if (_.has(context, "en") && _.has(context, "fr")) {
    context = context[lang];
  }
  return encodeURI(context);
});

HandlebarsWithPrototypeAccess.registerHelper("debug", function (optionalValue) {
  // eslint-disable no-console
  console.log("Current Context");
  console.log("====================");
  console.log(this);

  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});

HandlebarsWithPrototypeAccess.registerHelper("halt", function () {
  debugger; // eslint-disable-line no-debugger
});

HandlebarsWithPrototypeAccess.registerHelper(
  "callFunction",
  function (obj, func, options) {
    return _.map(obj[func](), options.fn).join("");
  }
);

HandlebarsWithPrototypeAccess.registerHelper(
  "fFunc",
  function (obj, func, options) {
    if (obj[func]()) {
      return options.fn;
    }
  }
);

HandlebarsWithPrototypeAccess.registerHelper("stripes", function (index) {
  return index % 2 == 0 ? "even" : "odd";
});

HandlebarsWithPrototypeAccess.registerHelper(
  "icon_tooltip",
  function glossary_tooltip(popup_text) {
    const raw_icon_html = ReactDOMServer.renderToStaticMarkup(
      <IconQuestion width={"1.2em"} svg_style={{ verticalAlign: "0em" }} />
    );

    // our svg icons include embeded style nodes using * selectors, which in particular mess up the resulting output of
    // text maker's markdown parsing, need to escape
    const selective_markdown_escaped_icon_html = raw_icon_html.replace(
      /\*/g,
      "\\*"
    );

    return new HandlebarsWithPrototypeAccess.SafeString(
      `<span
      style="display: inline-flex;"
      class="nowrap link-unstyled"
      tabindex="0"
      aria-hidden="true"
      data-toggle="glossary_sidebar"
      data-ibtt-html="true"
      data-ibtt-container="body"
      data-ibtt-text="${popup_text}"
    >
      ${selective_markdown_escaped_icon_html}
    </span>`
    );
  }
);

// register a handlebars helper for creating glossary links
// If a markdown link is written accordingly:
//  `[link text]({{gl ‘keytext’}}`
//  will produce:
// `[link text](#glossary-key "en/fr explanation that this links to a glossary")`
HandlebarsWithPrototypeAccess.registerHelper("gl", function glossary_link(key) {
  const href = glossary_href(key);
  var str = `(${href} "${trivial_text_maker("glossary_link_title")}")`;
  // SafeString is used to avoid having to use the [HandlebarsWithPrototypeAccess triple bracket syntax](http://handlebarsjs.com/#html_escaping)
  return new HandlebarsWithPrototypeAccess.SafeString(str);
});

HandlebarsWithPrototypeAccess.registerHelper(
  "gl_tt",
  function glossary_tooltip(display, key) {
    const glos_item = glossaryEntryStore.lookup(key);
    return new HandlebarsWithPrototypeAccess.SafeString(
      `<button 
        class="nowrap glossary-sidebar-link" 
        data-ibtt-glossary-key="${key}" 
        aria-label="${trivial_text_maker("open_glossary_definition", {
          display: display,
          title: glos_item.title,
        })}"
        data-toggle="glossary_sidebar"
      >
        ${display}
      </button>`
    );
  }
);

HandlebarsWithPrototypeAccess.registerHelper("gl_def", function (key) {
  const glos_item = glossaryEntryStore.lookup(key);
  var str = glos_item.get_compiled_definition();
  // SafeString is used to avoid having to use the [HandlebarsWithPrototypeAccess triple bracket syntax](http://handlebarsjs.com/#html_escaping)
  return new HandlebarsWithPrototypeAccess.SafeString(str);
});

HandlebarsWithPrototypeAccess.registerHelper(
  "gl_title_and_link",
  function (key) {
    const glos_item = glossaryEntryStore.lookup(key);
    const str = `<a href="${glossary_href(key)}">${glos_item.title}</a>`;
    // SafeString is used to avoid having to use the [HandlebarsWithPrototypeAccess triple bracket syntax](http://handlebarsjs.com/#html_escaping)
    return new HandlebarsWithPrototypeAccess.SafeString(str);
  }
);

HandlebarsWithPrototypeAccess.registerHelper("gl_title", function (key) {
  const glos_item = glossaryEntryStore.lookup(key);
  const str = glos_item.title;
  return str;
});

HandlebarsWithPrototypeAccess.registerHelper(
  "infograph_link",
  function (subject) {
    const href = infographic_href_template(subject);
    const str = `<a href="${href}" title="${trivial_text_maker(
      "infographic_for",
      { subject }
    )}">${subject.name}</a>`;
    return new HandlebarsWithPrototypeAccess.SafeString(str);
  }
);

HandlebarsWithPrototypeAccess.registerHelper(
  "datasets_source_link",
  function (link_text, source_key) {
    const str = `<a href=${"#datasets/" + source_key}>${link_text}</a>`;
    return new HandlebarsWithPrototypeAccess.SafeString(str);
  }
);

HandlebarsWithPrototypeAccess.registerHelper(
  "infograph_res_link",
  function (subject, text) {
    const href = infographic_href_template(subject, "results");

    const str = `<a href="${href}">${text}</a>`;
    return new HandlebarsWithPrototypeAccess.SafeString(str);
  }
);

HandlebarsWithPrototypeAccess.registerHelper("tag_link", function (tag) {
  const href = infographic_href_template(tag);
  const str = `<a href="${href}">${tag.name}</a>`;
  return new HandlebarsWithPrototypeAccess.SafeString(str);
});

HandlebarsWithPrototypeAccess.registerHelper(
  "pluralize",
  function (number, single) {
    if (number < 2) {
      return number + " " + single;
    } else {
      if (/[[]/g.test(single)) {
        return (
          number + " [" + single.replace(/[^a-zA-Z\u00C0-\u017F ]/g, "") + "s]"
        );
      } else {
        return number + " " + single + "s";
      }
    }
  }
);

HandlebarsWithPrototypeAccess.registerHelper(
  "plural_branch",
  function (number, single, plural) {
    if (number === 1) {
      return single;
    } else {
      return plural;
    }
  }
);

HandlebarsWithPrototypeAccess.registerHelper(
  "divide",
  function (numerator, denominator) {
    return numerator / denominator;
  }
);

HandlebarsWithPrototypeAccess.registerHelper(
  "ext_link",
  function (display, url, title) {
    if (url) {
      return new HandlebarsWithPrototypeAccess.SafeString(
        `<a target="_blank" rel="noopener noreferrer" href="${url}" ${
          _.isString(title) ? `title="${title}"` : ""
        }>${display}</a>`
      );
    } else {
      return display;
    }
  }
);
