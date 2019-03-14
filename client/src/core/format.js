import accounting from 'accounting';

// for properly formating numbers in multiple formats in both English and French
// * [compact written](#compact1_written) -> 2000000000 -> 2.0 billion
// * [compact1 ](#compact1) : 2100000000 -> 2.1 B
// * [compact0](#compact0) : 2100000000 -> 2.0 B
// * [percentage](#percentage) : 0.234231 -> 23.4%
// * [big_int](#big_int) : 2000000000 -> 2,000,000
// * [big_int_real](#big_int_real) : 2000000000 -> 2,000,000,000
// * [int](#int) : 2000000000 ->  2000000000 ->  2000000000
// * [str](#str) : 2000000000 -> "zero" -> "zero"
// * [wide-str](#wide-str) : "some long string" -> "some long string" 
//
//  relates to the column type attribute as of the table class
//  site.scss also establishes the widths for displaying each of the data types

const lang_options = {
  en: {},
  fr: {
    decimal: ',', 
    thousand: ' ',
  },
};
const lang_percent_symbol = {
  en: "%",
  fr: " %",
};

const compact = (val, lang, abbrev, precision) => {
  const abs = Math.abs(val);

  const format = abbrev.format ?
    abbrev.format[lang] :
    "%v %s";

  let symbol;
  let new_val;
  if (val === 0){ 
    return "0";
  } else if (abs >= 1000000000){
    new_val = val/1000000000;
    symbol = abbrev[1000000000][lang];
  } else if (abs >= 1000000){
    new_val = val/1000000;
    symbol = abbrev[1000000][lang];
  } else if (abs >= 1000){
    new_val = val/1000;
    symbol = abbrev[1000][lang];
  } else {
    new_val = val;
    symbol = abbrev[999][lang];
  }

  return accounting.formatMoney(
    new_val,
    {
      symbol: symbol, 
      precision: precision, 
      format: format,
      ...lang_options[lang],
    }
  );
};

/* 
  '0.00' -> '0'
  '1.0' -> '1'
  '2000' -> '2000'
*/
const trailing_zeroes_regex = (
  window.lang === 'en' ?
    new RegExp(/\.0+$/) :
    /* eslint-disable no-useless-escape */
    new RegExp(/\,0+$/)
);
const remove_trailing_zeroes_from_string = str => _.isString(str) && str.replace(trailing_zeroes_regex, "");

const compact_written = (precision, val, lang, options) => {
  let format;
  if (options.raw){
    format = {
      en: "$%v %s", 
      fr: "%v %s de dollars", 
    };
  } else {
    format = {
      en: "<span class='text-nowrap'>$%v</span> %s", 
      fr: "<span class='text-nowrap'>%v %s</span> de dollars", 
    };
  }

  return compact(
    val,
    lang,
    {
      format: format,
      1000000000: {en: 'billion', fr: 'milliards'},
      1000000: {en: 'million', fr: 'millions'},
      1000: {en: 'thousand', fr: 'milliers'},
      999: {en: '', fr: ''},
    },
    precision
  );
};

const types_to_format = {
  "compact1_written": _.curry(compact_written)(1),
  "compact2_written": _.curry(compact_written)(2),
  "compact": (val, lang, options) => {
    let format;
    if (options.raw){
      format = {
        en: "$%v %s", 
        fr: "%v %s$", 
      };
    }else {
      format = {
        en: "<span class='text-nowrap'>$%v %s</span>", 
        fr: "<span class='text-nowrap'>%v %s$</span>", 
      };
    }
    
    options.precision = options.precision || 0;

    return compact(
      val,
      lang,
      {
        format: format,
        1000000000: {en: 'B', fr: 'G'},
        1000000: {en: 'M', fr: 'M'},
        1000: {en: 'K', fr: 'k'},
        999: {en: '', fr: ''},
      },
      options.precision 
    );
  },
  "compact1": function(val, lang, options){ return this.compact(val, lang, {...options, precision: 1}); },
  "compact2": function(val, lang, options){ return this.compact(val, lang, {...options, precision: 2}); },
  "percentage": (val, lang, options) => {
    options.precision = options.precision || 0;

    const format = options.raw ?
      "%v%s" :
      "<span class='text-nowrap'>%v%s</span>";
    
    const _options = {
      symbol: lang_percent_symbol[lang],
      format: format,
      precision: options.precision || 0,
    };

    const val00 = _.isArray(val) ?
      _.map(val, x => x*100) :
      val * 100;

    return accounting.formatMoney(
      val00,
      {
        ..._options,
        ...lang_options[lang],
      }
    );
  },
  "percentage1": function(val, lang, options){ return this.percentage(val, lang, {...options, precision: 1}); },
  "percentage2": function(val, lang, options){ return this.percentage(val, lang, {...options, precision: 2}); },
  "result_percentage": (val, lang) => (+val).toString() + lang_percent_symbol[lang],
  "result_num": function(val){ return remove_trailing_zeroes_from_string( formats.decimal.call(this, val) ); },
  "decimal": (val, lang, options) => accounting.formatMoney(
    val, 
    {
      symbol: "",
      precision: 3,
      ...lang_options[lang],
    }
  ),
  "decimal1": (val, lang, options) => accounting.formatMoney(
    val, 
    {
      symbol: "",
      precision: 1,
      ...lang_options[lang],
    }
  ),
  "decimal2": (val, lang, options) => accounting.formatMoney(
    val, 
    {
      symbol: "",
      precision: 2,
      ...lang_options[lang],
    }
  ),
  "big_int": (val, lang, options) => {
    
    const value = _.isArray(val) ?
      _.map(val, x => x/1000) :
      val/1000;
    
    let rtn = accounting.formatNumber(
      value,
      {
        precision: 0,
        ...lang_options[lang],
      }
    );

    if (options.raw){
      return rtn;
    } else {
      return "<span class='text-nowrap'>"+rtn+"</span>";
    }
  },
  "big_int_real": (val, lang, options) => types_to_format["big_int"](val*1000, lang, options),
  "int": (val) => val,
  "ordinal": (val) => val,
  "str": (val) => val,
  "boolean": (val) => val,
  "wide-str": (val) => val,
  "short-str": (val) => val,
  "date": (val) => val,
  "dollar": (val, lang, options) => {
    options.precision = options.precision || 2;
    let format;
    if (options.raw){
      format = {
        en: "$%v", 
        fr: "%v $", 
      };
    }else {
      format = {
        en: "<span class='text-nowrap'>$%v</span>", 
        fr: "<span class='text-nowrap'>%v $</span>", 
      };
    }
    return accounting.formatMoney(
      val,
      {
        precision: options.precision, 
        format: format[lang],
        ...lang_options[lang],
      }
    );
  },
};


const formater = (format, val, options) => {
  options = options || {};
  if ( _.has(types_to_format, format) ){
    if ( _.isArray(val) ){
      return _.map(val, v => formater(format, v, options) );
    } else if (_.isObject(val)){
      return _.chain(val)
        .map( (v, k) => [k, formater(format, v, options)] )
        .fromPairs()
        .value();
    } else if ( _.isNaN(+val) && _.isString(val) ){
      return val;
    } else {
      return types_to_format[format](val, window.lang, options);
    }
  }
  return val;
};

// formats can be either an array of formats (of equal length to vals) or one format one which will be applied to all values
const list_formater = (formats, vals) => _.map(
  vals, 
  (value, ix) => !_.isArray(formats) ? 
    formater(formats[ix], value) : 
    formater(formats, value)
);

// setup all the Handlebars formatter functions based on the available formats
const formats = {};
_.each(
  _.toPairs(types_to_format), 
  (key_formater) => {
    const key = key_formater[0];

    formats[key] = (val, options) => {
      if ( !_.isObject(options) || _.isUndefined(options) ){
        options = {};
      }
      return formater(key, val, options);
    };

    formats[key+"_raw"] = (val, options) => {
      if ( !_.isObject(options) || _.isUndefined(options) ){
        options = {};
      }
      options.raw = true;
      return formater(key, val, options);
    };

    Handlebars.registerHelper("fmt_"+key, amount => new Handlebars.SafeString(formats[key](amount)));
    Handlebars.registerHelper("rawfmt_"+key, amount => new Handlebars.SafeString(formats[key+"_raw"](amount)));
  }
);

const dollar_formats = _.pickBy( formats, (format, key) => /^compact([0-9?]?)+_raw$/.test(key) );

export { 
  formater, 
  list_formater, 
  formats,
  dollar_formats,
};
