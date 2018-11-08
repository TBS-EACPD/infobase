/* eslint-disable no-console, no-debugger */
import { Subject } from '../models/subject';

import { GlossaryEntry } from '../models/glossary.js';
import { infograph_href_template, glossary_href } from '../link_utils.js';
import { trivial_text_maker, run_template } from '../models/text.js';

const change_map = {
  past : {
    to : {
      en : {
        increase : "increased to",
        decrease : "decreased to",
        constant : "remained unchanged",
      },
      fr: {
        increase : {
          ms : "a atteint",
          mp : "ont atteint",
          fs : "a atteint",
          fp : "ont atteint",
        },
        decrease : {
          ms : "a diminué jusqu'à",
          mp : "ont diminué jusqu'à",
          fs : "a diminuée jusqu'à",
          fp : "ont diminué jusqu'à",
        }, 
        constant : {
          ms : "est demeuré constant",
          mp : "sont demeurés constants",
          fs : "est demeurée constante",
          fp : "sont demeurées constantes",
        },
      },
    },
    by : {
      en : {
        increase : "increased by",
        decrease : "decreased by",
        constant : "remained unchanged",
      },
      fr: {
        increase : {
          ms : "a augmenté de ",
          mp : "ont affiché une hausse de ",
          fs : "a augmenté de ",
          fp : "ont affiché une hausse de ",
        },
        decrease : {
          ms : "a diminué de ",
          mp : "ont diminué de ",
          fs : "a diminué de ",
          fp : "ont diminué de ",
        }, 
        constant : {
          ms : "est demeuré constant",
          mp : "sont demeurés constants",
          fs : "est demeurée constante",
          fp : "sont demeurées constantes",
        },
      },
    },
    ing : {
      en : {
        increase : "an increase of",
        decrease : "a decrease of",
        constant : "remaining unchanged",
      },
      fr: {
        increase : {
          ms : "une hausse de ",
          mp : "ont affiché une hausse de ",
          fs : "une hausse de ",
          fp : "ont affiché une hausse de ",
        },
        decrease : {
          ms : "une baisse de ",
          mp : "ont affiché une baisse de ",
          fs : "une baisse de ",
          fp : "ont affiché une baisse de ",
        },
        constant : {
          ms : "est demeuré constant",
          mp : "sont demeurés constants",
          fs : "est demeurée constante",
          fp : "sont demeurées constantes",
        },
      },
    },
  },
  future : {
    to : {
      en : {
        increase : "planned to increase to",
        decrease : "planned to decrease to", 
        constant : "planned to remain unchanged",
      },
      fr: {
        increase : {
          s : "va atteindre",
          p : "vont atteindre",
        },
        decrease : {
          s : "va diminuer jusqu'à",
          p : "vont diminuer jusqu'à",
        }, 
        constant : {
          ms : "va demeurer constant",
          fs : "va demeurer constante",
          mp : "vont demeurer constants",
          fp : "vont demeurer constantes",
        },
      },
    },
    by : {
      en : {
        increase : "planned to increase by",
        decrease : "planned to decrease by", 
        constant : "planned to remain unchanged",
      },
      fr: {
        increase : {
          s : "va augmenter de",
          p : "vont augmenter de",
        },
        decrease : {
          s : "va diminuer de",
          p : "vont diminuer de",
        }, 
        constant : {
          ms : "va demeurer constant",
          fs : "va demeurer constante",
          mp : "vont demeurer constants",
          fp : "vont demeurer constantes",
        },
      },
    },
  },
};
// a series of [handlebars.js](http://handlebarsjs.com/)
// [helpers](http://handlebarsjs.com/#helpers)
//

const calc_direction = function(val){
  return val === 0 ? "constant" : (val > 0 ? "increase" : "decrease");
};
const en_master_change = function(val,formater,preposition,tense){
  const direction = calc_direction(val);
  let return_value = change_map[tense][preposition]["en"][direction];
  if (direction !== 'constant' && formater.length>0){
    return_value += " " + Handlebars.helpers[formater](Math.abs(val));
  }
  return new Handlebars.SafeString(return_value);
};
const fr_master_change = function(val,formater,preposition,temps,genre, nombre){
  const direction = calc_direction(val);
  if (temps === 'future' && direction !== 'constant'){
    genre = "";
  }
  let return_value=change_map[temps][preposition]["fr"][direction][genre+nombre];
  if ( direction !== 'constant' && formater.length>0){
    return_value += " " + Handlebars.helpers[formater](Math.abs(val));
  }
  return new Handlebars.SafeString(return_value);
};
Handlebars.registerHelper("changed_to",function(val,formater,context){
  return en_master_change(val,formater,"to","past");
});
Handlebars.registerHelper("changed_by",function(val,formater,context){
  return en_master_change(val,formater,"by","past");
});
// Dom code:
Handlebars.registerHelper("changing_by",function(val,formater,context){
  return en_master_change(val,formater,"ing","past");
});

Handlebars.registerHelper("will_change_to",function(val,formater,context){
  return en_master_change(val,formater,"to","future");
});
Handlebars.registerHelper("will_change_by",function(val,formater,context){
  return en_master_change(val,formater,"by","future");
});
Handlebars.registerHelper("fr_changed_to",function(val, genre, nombre,formater,context){
  return fr_master_change(val,formater,"to","past",genre,nombre);
});
Handlebars.registerHelper("fr_changed_by",function(val, genre, nombre,formater,context){
  return fr_master_change(val,formater,"by","past",genre,nombre);
});
// Dom code:
Handlebars.registerHelper("fr_changing_by",function(val, genre, nombre,formater,context){
  return fr_master_change(val,formater,"ing","past",genre,nombre);
});
Handlebars.registerHelper("fr_will_change_by",function(val, genre, nombre,formater,context){
  return fr_master_change(val,formater,"by","future",genre,nombre);
});
Handlebars.registerHelper("fr_will_change_to",function(val, genre, nombre,formater,context){
  return fr_master_change(val,formater,"to","future",genre,nombre);
});

// Two value change helpers (Ex. "increased/decreased from val1 to val2")
const two_value_change_map = {
  past : {
    to : {
      en : {
        increase : ["increased from", "to"],
        decrease : ["decreased from", "to"],
        constant : "remained unchanged at",
      },
      fr: {
        increase : {
          ms : ["a augmenté de", "à"],
          mp : ["ont augmenté de", "à"],
          fs : ["a augmenté de", "à"],
          fp : ["ont augmenté de", "à"],
        },
        decrease : {
          ms : ["a diminué de", "à"],
          mp : ["ont diminué de", "à"],
          fs : ["a diminuée de", "à"],
          fp : ["ont diminué de", "à"],
        }, 
        constant : {
          ms : "est demeuré constant",
          mp : "sont demeurés constants",
          fs : "est demeurée constante",
          fp : "sont demeurées constantes",
        },
      },
    },
  },
};
const two_value_calc_direction = function(val1,val2,formater){
  // Compare with formatting for equality, as formatting may effectively round two numbers TO equality
  // Don't format for lesser than test, as formatting may mess that up
  return Handlebars.helpers[formater](val1).string === Handlebars.helpers[formater](val2).string ? 
           "constant" : 
           (
             val1 < val2 ? 
               "increase" : 
               "decrease"
           );
};
const en_master_two_value_change = function(val1,val2,formater,preposition,tense){
  let return_value = "INVALID FORMATER"; // Will only be returned if passed formater invalid
  if(formater.length>0){
    const direction = two_value_calc_direction(val1,val2,formater);
    const two_value_change_text_components = two_value_change_map[tense][preposition]["en"][direction];
    if (direction !== 'constant'){
      return_value = (
        two_value_change_text_components[0] + " " + 
                        Handlebars.helpers[formater](val1) + " " + 
                        two_value_change_text_components[1] + " " + 
                        Handlebars.helpers[formater](val2)
      );
    } else {
      return_value = two_value_change_text_components + " " + Handlebars.helpers[formater](val1); 
    }
  }
  return new Handlebars.SafeString(return_value);
};
const fr_master_two_value_change = function(val1,val2,formater,preposition,temps,genre,nombre){
  let return_value = "INVALID FORMATER"; // Will only be returned if passed formater is invalid
  if(formater.length>0){
    const direction = two_value_calc_direction(val1,val2,formater);
    const two_value_change_text_components = two_value_change_map[temps][preposition]["fr"][direction][genre+nombre];
    if (direction !== 'constant'){
      return_value = (
        two_value_change_text_components[0] + " " + 
                        Handlebars.helpers[formater](val1) + " " + 
                        two_value_change_text_components[1] + " " + 
                        Handlebars.helpers[formater](val2)
      );
    } else {
      return_value = two_value_change_text_components + " " + Handlebars.helpers[formater](val1); 
    }
  }
  return new Handlebars.SafeString(return_value);
};
Handlebars.registerHelper("two_value_changed_to",function(val1,val2,formater,context){
  return en_master_two_value_change(val1,val2,formater,"to","past");
});
Handlebars.registerHelper("fr_two_value_changed_to",function(val1,val2,genre,nombre,formater,context){
  return fr_master_two_value_change(val1,val2,formater,"to","past",genre,nombre);
});

// Helper to expand positive negative values to "[+/-]abs(value)"
Handlebars.registerHelper("plus_or_minus_val",function(val,formater,context){
  return (val >= 0 ?
           "+":
           "-"
  ) +
         Handlebars.helpers[formater](Math.abs(val));
});

// {{gt "key"}} -> looks up the key and returns 
// the correct language 
Handlebars.registerHelper("gt",function(context, other_arg){
  //handlebars will change the "this" if a helper is called within an #each block
  if(!_.isFunction(this.__text_maker_func__)){
    return other_arg.data.root.__text_maker_func__(context);
  }
  return this.__text_maker_func__(context);
});

// {{rt "key"}} -> runs template 
Handlebars.registerHelper("rt",function(context){
  return run_template(context);
});

// taken from [this recipe](http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/)
Handlebars.registerHelper('isEqual', function(lvalue, rvalue,options) {
  if (lvalue === rvalue){
    return options.fn(this);
  } else {
    return options.inverse(this);
  }  
});


// taken from [this recipe](http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/)
Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {
  lvalue = +lvalue.toString();
  rvalue = +rvalue.toString();

  if (arguments.length < 3) {
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
  }

  var operator = options.hash.operator || "==";

  var operators = {
    '==': function(l,r) { return l === r; },
    '===': function(l,r) { return l === r; },
    '!=': function(l,r) { return l !== r; },
    '<': function(l,r) { return l < r; },
    '>': function(l,r) { return l > r; },
    '<=': function(l,r) { return l <= r; },
    '>=': function(l,r) { return l >= r; },
  };

  if (!operators[operator]) {
    throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
  }

  var result = operators[operator](lvalue,rvalue);

  if( result ) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }

});

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
Handlebars.registerHelper("lang",function(context){
  if (context && _.has(context, window.lang)){
    return context[window.lang];
  } else if(context.text){ 
    return context.text;
  } else {
    return "";
  }
});

function subject_name(subject){

  if (subject.is("dept")){
    return (
        !_.isEmpty(subject.applied_title) ?
        subject.applied_title :
        subject.name
    );

  } else {
    return subject.name;
  }
};

Handlebars.registerHelper('subj_name', subject_name);


Handlebars.registerHelper('cr_or_so', subject => {

  return subject.singular();

});

Handlebars.registerHelper('ce_crso', crso => {
  if(crso.is_cr){
    return `cette ${trivial_text_maker('core_resp')}`;
  } else {
    return `ce ${trivial_text_maker('strategic_outcome')}`;
  }
});

Handlebars.registerHelper('le_crso', crso => {
  if(crso.is_cr){
    return `la ${trivial_text_maker('core_resp')}`;
  } else {
    return `le ${trivial_text_maker('strategic_outcome')}`;
  }
});

Handlebars.registerHelper('du_crso', crso => {
  if(crso.is_cr){
    return `de la ${trivial_text_maker('core_resp')}`;
  } else {
    return `du ${trivial_text_maker('strategic_outcome')}`;
  }
});

// looks up the name for the department if passed
// a department object
Handlebars.registerHelper("dept", context => {
  if(window.is_dev_build){
    console.error('"dept" handlebars helper is deprecated, pass the subject OBJECT to the helper "subj_name" instead');
  }

  if(context.constructor){
    return subject_name(context);
  }
  else {
    return Subject.Dept.lookup(context).applied_title;
  }
});


// looks up the name for the department if passed
// a department object
Handlebars.registerHelper("de_dept",function(context){
  let dept;
  if (context.is("dept")){
    dept = context;
  } else {
    dept = Subject.Dept.lookup(context); 
  }
  let article = dept.du_de_la;
  if (article.length > 0 && _.last(article) !== "'") {
    article += " ";
  }
  return article + (dept.applied_title || dept.name);

});
// looks up the name for the department if passed
// a department object
Handlebars.registerHelper("le_dept",function(context){
  let dept;
  if (context.is("dept")){
    dept = context;
  } else {
    dept = Subject.Dept.lookup(context); 
  }
  let article = dept.le_la;
  if (article.length > 0 && _.last(article) !== "'") {
    article += " ";
  }
  return article + (dept.applied_title || dept.name);
});

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
Handlebars.registerHelper("encodeURI",function(context,options){
  if (_.has(context,'en') && _.has(context,"fr")){
    context = context[window.lang];
  }
  return encodeURI(context);
});


Handlebars.registerHelper("debug", function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);
 
  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});

Handlebars.registerHelper("halt", function(){
  debugger; 
});

Handlebars.registerHelper("callFunction", function(obj,func,options){
  return _.map(obj[func](), options.fn).join("");
});

Handlebars.registerHelper("fFunc", function(obj,func,options){
  if (obj[func]()){
    return options.fn;
  }
});

Handlebars.registerHelper("stripes", function(index) {
  return (index % 2 == 0 ? "even" : "odd");
});


// register a handlebars helper for creating glossary links
// If a markdown link is written accordingly:
//  `[link text]({{gl ‘keytext’}}`
//  will produce:
// `[link text](#glossary-key "en/fr explanation that this links to a glossary")`
Handlebars.registerHelper("gl", function glossary_link(key){
  const href = glossary_href(GlossaryEntry.lookup(key));
  var str = `(${href} "${trivial_text_maker('glossary_link_title')}")`;
  // SafeString is used to avoid having to use the [Handlebars triple bracket syntax](http://handlebarsjs.com/#html_escaping)
  return new Handlebars.SafeString(str);
});


//produces a link with glossary tooltip
function glossary_tooltip(display, key){
  return new Handlebars.SafeString(
    `<span class="nowrap glossary-tooltip-link" tabindex="0" aria-hidden="true" data-glossary-key="${key}" data-toggle="tooltip" data-html="true" data-container="body">${display}</span>`
  );
}

function tooltip_a11y_fallback(display, key){
  const href = glossary_href(GlossaryEntry.lookup(key));
  return new Handlebars.SafeString(
    `<a href=${href} title="${trivial_text_maker("glossary_link_title")}">${display}</a>`
  );
}

Handlebars.registerHelper("gl_tt", window.is_a11y_mode ? tooltip_a11y_fallback : glossary_tooltip );


Handlebars.registerHelper("gl_def",function(key){
  const glos_item = GlossaryEntry.lookup(key);
  var str = glos_item.definition;
  // SafeString is used to avoid having to use the [Handlebars triple bracket syntax](http://handlebarsjs.com/#html_escaping)
  return new Handlebars.SafeString(str);
});

Handlebars.registerHelper("gl_title_and_link",function(key){
  const glos_item = GlossaryEntry.lookup(key);
  const str = `<a href="${glossary_href(glos_item)}">${glos_item.title}</a>`;
  // SafeString is used to avoid having to use the [Handlebars triple bracket syntax](http://handlebarsjs.com/#html_escaping)
  return new Handlebars.SafeString(str);
});

Handlebars.registerHelper("gl_title",function(key){
  const glos_item = GlossaryEntry.lookup(key);
  const str = glos_item.title;
  return str;
})


Handlebars.registerHelper("infograph_link",function(subject){
  const href = infograph_href_template(subject); 
  const str = `<a href="${href}" title="${trivial_text_maker('see_an_infograph_for', { subject })}">${subject.sexy_name}</a>`;
  return new Handlebars.SafeString(str);
});


Handlebars.registerHelper("metadata_source_link",function(link_text, source_key){
  const str = `<a href=${"#metadata/"+source_key}>${link_text}</a>`;
  return new Handlebars.SafeString(str);
});

Handlebars.registerHelper("infograph_res_link",function(subject, text){
  const href = infograph_href_template(subject, 'results'); 
  
  const str = `<a href="${href}">${text}</a>`;
  return new Handlebars.SafeString(str);
});

Handlebars.registerHelper("tag_link",function(tag){
  const href = infograph_href_template(tag); 
  const str = `<a href="${href}">${tag.name}</a>`;
  return new Handlebars.SafeString(str);
});

Handlebars.registerHelper('pluralize', function(number, single) {

  if (number < 2) { 
    return number + " " + single; 
  }
  else { 
    if(/[[]/g.test(single)){
      return number + " [" + single.replace(/[^a-zA-Z\u00C0-\u017F ]/g, "") + 's]'; 
    }
    else{
      return number + " " + single + 's'; 
    }
  }

});

Handlebars.registerHelper('plural_branch', function(number, single, plural){
  if(number === 1){
    return single;
  } else {
    return plural;
  }

});


Handlebars.registerHelper("divide",function(numerator, denominator){
  return numerator/denominator;
});

Handlebars.registerHelper("ext_link",function(display,url){
  return new Handlebars.SafeString(
    `<a target="_blank" rel="noopener noreferrer" href="${url}">${display}</a>`
  );
})


