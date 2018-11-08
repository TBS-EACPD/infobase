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
// * [date](#date) -> date : date (not being used)
//
//  relates to the column type attribute as defined [here](table_definition.html)
//  and file site.css also establishes the widths for displaying each of the
//  data types

var compact = function(val,lang, abbrev, precision){
  let symbol;
  let abs = Math.abs(val);
  let format;
  let new_val;
  if (abbrev.format) {
    format = abbrev.format[lang];
  } else {
    format = "%v %s";
  }
  if (val === 0) { 
    return "0";
  } else if (abs >= 1000000000){
    new_val = val / 1000000000;
    symbol = abbrev[1000000000][lang];
  }
  else if (abs >= 1000000){
    new_val = val / 1000000;
    symbol = abbrev[1000000][lang];
  }
  else if (abs >= 1000){
    new_val = val / 1000;
    symbol = abbrev[1000][lang];
  }
  else {
    new_val = val;
    symbol = abbrev[999][lang];
  }
  if (lang === 'en'){
    return accounting.formatMoney(new_val,
      {symbol: symbol,precision: precision, format: format});
  } else if (lang === 'fr'){
    return accounting.formatMoney(new_val,{
      decimal: ',', thousand: ' ',
      format: format, symbol: symbol,
      precision: precision,
    });
  }
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
const remove_trailing_zeroes_from_string = str => _.isString(str) && str.replace(trailing_zeroes_regex,"");

const compact_written = (precision,val,lang,options) => {
  var format;
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
      1000000000: {en: 'billion', 
        fr: 'milliards' },
      1000000: {en: 'million', fr: 'millions'},
      1000: {en: 'thousand', fr: 'milliers'},
      999: {en: '', fr: ''},
    },
    precision
  );
};

var types_to_format = {
  //<div id='compact1_written'></div>
  "compact1_written": _.curry(compact_written)(1),
  "compact2_written": _.curry(compact_written)(2),
  //<div id='compact1'></div>
  "compact": function(val, lang,options){
    var format;
    options.precision = options.precision || 0;
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
    return compact(val, lang, {
      format: format,
      1000000000: {en: 'B', fr: 'G'},
      1000000: {en: 'M', fr: 'M'},
      1000: {en: 'K', fr: 'k'},
      999: {en: '', fr: ''},
    },options.precision );
  },
  //<div id='compact0'></div>
  "compact1": function(val, lang,options){
    options.precision = 1;
    return this.compact(val, lang,options);
  },
  "compact2": function(val, lang,options){
    options.precision = 2;
    return this.compact(val, lang,options);
  },
  //<div id='percentage'></div>
  "percentage": function(val,lang,options){
    options.precision = options.precision || 0;
    var format;
    if (options.raw){
      format = "%v%s";
    }else {
      format = "<span class='text-nowrap'>%v%s</span>";
    }
    var _options = {
      symbol: "%",
      format: format,
      precision: options.precision || 0,
    };

    if (_.isArray(val)){
      val = _.map(val, function(x){return x*100;});
    } else {
      val = val * 100;
    }
    if (lang === 'en'){
      return accounting.formatMoney(val,_options);
    } else if (lang === 'fr'){
      return accounting.formatMoney(val,_.extend(_options,{
        decimal: ',',
        thousand: ' ',
      }));
    }
  },
  "percentage1": function(val,lang,options){
    options.precision = 1;
    return this.percentage(val,lang,options);
  },
  "percentage2": function(val,lang,options){
    options.precision = 2;
    return this.percentage(val,lang,options);
  },
  "result_percentage": function(val){
    return (+val).toString()+"%";
  },
  "result_num": function(val){
    return remove_trailing_zeroes_from_string(formats.decimal.call(this, val));
  },
  "decimal": function(val,lang,options){
    var _options = {symbol: "", precision: 3 };
    if (lang === 'en'){
      return accounting.formatMoney(val,_options);
    } else if (lang === 'fr'){
      return accounting.formatMoney(val,_.extend(_options,{
        decimal: ',',
        thousand: ' ',
      }));
    }
  },
  "decimal1": function(val,lang,options){
    var _options = {symbol: "", precision: 1 };
    if (lang === 'en'){
      return accounting.formatMoney(val,_options);
    } else if (lang === 'fr'){
      return accounting.formatMoney(val,_.extend(_options,{
        decimal: ',',
        ten: ' ',
      }));
    }
  },
  "decimal2": function(val,lang,options){
    var _options = {symbol: "", precision: 2 };
    if (lang === 'en'){
      return accounting.formatMoney(val,_options);
    } else if (lang === 'fr'){
      return accounting.formatMoney(val,_.extend(_options,{
        decimal: ',',
        ten: ' ',
      }));
    }
  },
  //<div id='big_int'></div>
  "big_int": function(val,lang,options){
    var rtn;
    if (_.isArray(val)){
      val = _.map(val, function(x){return x/1000;});
    } else {
      val = val / 1000;
    }
    if (lang === 'en'){
      rtn = accounting.formatNumber(val,{precision: 0});
    } else if (lang === 'fr'){
      rtn = accounting.formatNumber(val,{
        decimal: ',',
        thousand: ' ',
        precision: 0,
      });
    }
    if (options.raw){
      return rtn;
    } else {
      return "<span class='text-nowrap'>"+rtn+"</span>";
    }
  },
  //<div id='big_int_real'></div>
  "big_int_real": function(val,lang,options){
    return types_to_format["big_int"](val*1000,lang,options);
  },
  //<div id='int'></div>
  "int": function(val,lang){return val;},
  //<div id='ordinal'></div>
  "ordinal": function(val,lang){return val;},
  //<div id='str'></div>
  "str": function(val,lang){return val;},
  "str1": function(val,lang,options){
    options.precision = 1;
    return this.percentage(val,lang,options);   
  },
  //<div id='str'></div>
  "boolean": function(val,lang){return val;},
  //<div id='wide-str'></div>
  "wide-str": function(val,lang){return val;},
  //<div id='short-str'></div>
  "short-str": function(val,lang){return val;},
  //<div id='date'></div>
  "date": function(val,lang){return val;},
};

// <div id='formater'></div>
var formater = function(format,val,options){
  options = options || {};
  if (_.has(types_to_format,format)){
    if (_.isArray(val)){
      return _.map(val, v => formater(format,v,options) );
    } else if (_.isObject(val)){
      return _.chain(val)
        .map( (v,k) => [k,formater(format,v,options)] )
        .fromPairs()
        .value();
    } else if (_.isNaN(+val) && _.isString(val)){
      return val;
    } else {
      return types_to_format[format](val,window.lang,options);
    }
  }
  return val;
};

// <div id='list_formater'></div>
var list_formater = function(formats,vals){
  // formats can be either an array of values or one single one
  // which will be duplicated for each item in vals
  if (!_.isArray(formats)){
    formats = _.map(vals, _val => formats);
  }
  return _.map(formats, (format,i) => formater(format,vals[i]) )
};

// setup all the formatter functions based on the available
// formats
const formats = {};
_.each(_.toPairs(types_to_format), function(key_formater){
  var key = key_formater[0];
  //var _formater = key_formater[1];
  formats[key] = function(val,options){
    if (!_.isObject(options) || _.isUndefined(options)){
      options = {};
    }
    return formater(key,val,options);
  };
  formats[key+"_raw"] = function(val,options){
    if (!_.isObject(options) || _.isUndefined(options)){
      options = {};
    }
    options.raw = true;
    return formater(key,val,options);
  };
  Handlebars.registerHelper("fmt_"+key, amount => new Handlebars.SafeString(formats[key](amount)));
  Handlebars.registerHelper("rawfmt_"+key, amount => new Handlebars.SafeString(formats[key+"_raw"](amount)));
});

export { 
  list_formater, 
  formater, 
  formats, 
};
