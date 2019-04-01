//  for properly formating numbers in multiple formats in both English and French
//  relates to the column type attribute as of the table class
//  site.scss also establishes the widths for displaying each of the data types


const number_formatter = {
  en: _.map(Array(4), (val,ix) => new Intl.NumberFormat('en-CA', {style: 'decimal', minimumFractionDigits: ix, maximumFractionDigits: ix}) ),
  fr: _.map(Array(4), (val,ix) => new Intl.NumberFormat('fr-CA', {style: 'decimal', minimumFractionDigits: ix, maximumFractionDigits: ix}) ),
}
const money_formatter = {
  en: _.map(Array(3), (val,ix) => new Intl.NumberFormat('en-CA', {style: 'currency', currency: 'CAD', minimumFractionDigits: ix, maximumFractionDigits: ix}) ),
  fr: _.map(Array(3), (val,ix) => new Intl.NumberFormat('fr-CA', {style: 'currency', currency: 'CAD', minimumFractionDigits: ix, maximumFractionDigits: ix}) ),
}
const percent_formatter = {
  en: _.map(Array(3), (val,ix) => new Intl.NumberFormat('en-CA', {style: 'percent', minimumFractionDigits: ix, maximumFractionDigits: ix}) ),
  fr: _.map(Array(3), (val,ix) => new Intl.NumberFormat('fr-CA', {style: 'percent', minimumFractionDigits: ix, maximumFractionDigits: ix}) ),
}

// results need to be displayed with the number of digits they are entered in. We don't do any rounding!
const result_number_formatter = {
  en: new Intl.NumberFormat('en-CA', {style: 'decimal', maximumFractionDigits: 10, minimumFractionDigits: 0}),
  fr: new Intl.NumberFormat('fr-CA', {style: 'decimal', maximumFractionDigits: 10, minimumFractionDigits: 0}),
}
const result_percent_formatter = {
  en: new Intl.NumberFormat('en-CA', {style: 'percent', maximumFractionDigits: 10, minimumFractionDigits: 0}),
  fr: new Intl.NumberFormat('fr-CA', {style: 'percent', maximumFractionDigits: 10, minimumFractionDigits: 0}),
}


const compact = (precision, val, lang, options) => {  
  precision = precision || 0;

  const abbrev = {
    1000000000: {en: 'B', fr: 'G'},
    1000000: {en: 'M', fr: 'M'},
    1000: {en: 'K', fr: 'k'},
    999: {en: '', fr: ''},
  };

  const abs = Math.abs(val);
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

  // for now, can't use the money formatter if we want to insert
  // custom symbols in the string. There is an experimental
  // formatToParts function that may be useful in the future
  const rtn = number_formatter[lang][precision].format(new_val);

  if (options.raw){
    return lang === 'fr' ? `${rtn} ${symbol}$` : `$${rtn} ${symbol}`; 
  }else {
    return lang === 'fr' ? `<span class='text-nowrap'>${rtn} ${symbol}$</span>` : `<span class='text-nowrap'>$${rtn} ${symbol}</span>`;
  }
};

const compact_written = (precision, val, lang, options) => {

  // the rules for this are going to be different from compact(),
  // emphasizing readability.
  // specifically, small numbers (< 50,000) are treated differently

  const abbrevs = {
    1000000000: {en: ' billion', fr: ' milliards'},
    1000000: {en: ' million', fr: ' millions'},
    1000: {en: ' thousand', fr: ' milliers'},
    999: {en: '', fr: ''},
  };

  const abs = Math.abs(val);
  let rtn = '0';
  let abbrev = '';
  if (abs >= 50000){
    let reduced_val;

    if (abs >= 1000000000){
      reduced_val = val/1000000000;
      abbrev = abbrevs[1000000000][lang];
    } else if (abs >= 1000000){
      reduced_val = val/1000000;
      abbrev = abbrevs[1000000][lang];
    } else {
      reduced_val = val/1000;
      abbrev = abbrevs[1000][lang];
      if (precision < 2){
        precision = 0;
      }
    }
    rtn = number_formatter[lang][precision].format(reduced_val);

  } else {
    if (precision < 2){
      precision = 0;
    }
    abbrev = abbrevs[999][lang];
    rtn = number_formatter[lang][precision].format(val);
  }

  if (options.raw){
    return lang === 'fr' ? `${rtn}${abbrev} de dollars` : `$${rtn}${abbrev}`; 
  }else {
    return lang === 'fr' ? `<span class='text-nowrap'>${rtn}${abbrev}</span> de dollars` : `<span class='text-nowrap'>$${rtn}</span>${abbrev}`;
  }
};

const percentage = (precision, val, lang, options) => {
  precision = precision || 0;
  const rtn = percent_formatter[lang][precision].format(val)
  if (options.raw){
    return rtn;
  }else {
    return `<span class='text-nowrap'>${rtn}</span>`;
  }
}

const types_to_format = {
  "compact": (val, lang, options) => compact(options.precision, val, lang, options),
  "compact1": _.curry(compact)(1),
  "compact2": _.curry(compact)(2),
  "compact_written": (val, lang, options) => compact_written(options.precision, val, lang, options),
  "compact1_written": _.curry(compact_written)(1),
  "compact2_written": _.curry(compact_written)(2),
  "percentage": (val, lang, options) => percentage(options.precision, val, lang, options),
  "percentage1": _.curry(percentage)(1),
  "percentage2": _.curry(percentage)(2),
  "result_percentage": (val, lang) => result_percent_formatter[lang].format(val/100),
  "result_num": (val, lang) => result_number_formatter[lang].format(val),
  "decimal1": (val, lang, options) => number_formatter[lang][1](val),
  "decimal2": (val, lang, options) => number_formatter[lang][2](val),
  "decimal": (val, lang, options) => number_formatter[lang][3](val),
  "big_int": (val, lang, options) => {
    const value = _.isArray(val) ?
      _.map(val, x => x/1000) :
      val/1000;
    
    const rtn = number_formatter[lang][0].format(value);

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
    
    const rtn = money_formatter[lang][options.precision].format(val);

    if (options.raw){
      return rtn;
    } else {
      return "<span class='text-nowrap'>"+rtn+"</span>";
    }
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
  (key_formatter) => {
    const key = key_formatter[0];

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
