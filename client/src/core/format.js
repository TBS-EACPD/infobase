//  for properly formating numbers in multiple formats in both English and French
//  relates to the column type attribute as of the table class
//  site.scss also establishes the widths for displaying each of the data types
import _ from "lodash";

import { lang } from "src/core/injected_build_constants.js";

const number_formatter = {
  en: _.map(
    Array(4),
    (val, ix) =>
      new Intl.NumberFormat("en-CA", {
        style: "decimal",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
  fr: _.map(
    Array(4),
    (val, ix) =>
      new Intl.NumberFormat("fr-CA", {
        style: "decimal",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
};
const money_formatter = {
  en: _.map(
    Array(3),
    (val, ix) =>
      new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
  fr: _.map(
    Array(3),
    (val, ix) =>
      new Intl.NumberFormat("fr-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
};
const percent_formatter = {
  en: _.map(
    Array(4),
    (val, ix) =>
      new Intl.NumberFormat("en-CA", {
        style: "percent",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
  fr: _.map(
    Array(4),
    (val, ix) =>
      new Intl.NumberFormat("fr-CA", {
        style: "percent",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
};

// results need to be displayed with the number of digits they are entered in. We don't do any rounding!
const result_number_formatter = {
  en: new Intl.NumberFormat("en-CA", {
    style: "decimal",
    maximumFractionDigits: 10,
    minimumFractionDigits: 0,
  }),
  fr: new Intl.NumberFormat("fr-CA", {
    style: "decimal",
    maximumFractionDigits: 10,
    minimumFractionDigits: 0,
  }),
};
const result_percent_formatter = {
  en: new Intl.NumberFormat("en-CA", {
    style: "percent",
    maximumFractionDigits: 10,
    minimumFractionDigits: 0,
  }),
  fr: new Intl.NumberFormat("fr-CA", {
    style: "percent",
    maximumFractionDigits: 10,
    minimumFractionDigits: 0,
  }),
};

const compact = (precision, val, lang, options) => {
  precision = precision || 0;

  const abbrev = {
    1000000000: { en: "B", fr: "G" },
    1000000: { en: "M", fr: "M" },
    1000: { en: "K", fr: "k" },
    999: { en: "", fr: "" },
  };

  const abs = Math.abs(val);
  const [symbol, new_val] = (() => {
    if (val === 0) {
      return ["", 0];
    } else {
      const compacted = _.times(3, (i) => {
        //can't break out of a lodash loop
        const breakpoint = 1000000000 / Math.pow(10, i * 3); //checking 1B, 1M, and 1K
        if (abs >= breakpoint) {
          return [abbrev[breakpoint][lang], val / breakpoint];
        }
      });

      const defined_compacted = _.filter(compacted, (pair) => {
        return !_.isUndefined(pair);
      });

      return defined_compacted.length > 0
        ? defined_compacted[0]
        : [abbrev[999][lang], val];
    }
  })();

  // for now, can't use the money formatter if we want to insert
  // custom symbols in the string. There is an experimental
  // formatToParts function that may be useful in the future
  const rtn = number_formatter[lang][precision].format(new_val);
  let compactStr = !symbol ? rtn : `${rtn} ${symbol}`;
  if (options.raw) {
    return options.noMoney
      ? compactStr
      : lang === "fr"
      ? `${compactStr}$`
      : `$${compactStr}`;
  } else {
    return options.noMoney
      ? `<span class='text-nowrap'>${compactStr}</span>`
      : lang === "fr"
      ? `<span class='text-nowrap'>${compactStr}$</span>`
      : `<span class='text-nowrap'>$${compactStr}</span>`;
  }
};

const compact_written = (precision, val, lang, options) => {
  // the rules for this are going to be different from compact(),
  // emphasizing readability.
  // specifically, small numbers are treated differently

  const abbrevs = {
    1000000000: { en: " billion", fr: " milliards" },
    1000000: { en: " million", fr: " millions" },
    1000: { en: " thousand", fr: " milliers" },
    999: { en: "", fr: "" },
  };

  const abs = Math.abs(val);

  const [rtn, abbrev] = (() => {
    if (abs >= 50000) {
      const compacted = _.times(3, (i) => {
        //can't break out of a lodash loop
        const breakpoint = 1000000000 / Math.pow(10, i * 3); //checking 1B, 1M, and 1K
        precision = i === 2 && precision < 2 ? 0 : precision;
        if (abs >= breakpoint) {
          return [
            number_formatter[lang][precision].format(val / breakpoint),
            abbrevs[breakpoint][lang],
          ];
        }
      });

      const defined_compacted = _.filter(compacted, (pair) => {
        return !_.isUndefined(pair);
      });

      return defined_compacted[0];
    } else {
      precision = precision < 2 ? 0 : precision;
      return [
        number_formatter[lang][precision].format(val),
        abbrevs[999][lang],
      ];
    }
  })();

  if (options.raw) {
    return lang === "fr" ? `${rtn}${abbrev} de dollars` : `$${rtn}${abbrev}`;
  } else {
    return lang === "fr"
      ? `<span class='text-nowrap'>${rtn}${abbrev}</span> de dollars`
      : `<span class='text-nowrap'>$${rtn}</span>${abbrev}`;
  }
};

const percentage = (precision, val, lang, options) => {
  precision = precision || 0;
  const rtn = percent_formatter[lang][precision].format(val);
  if (options.raw) {
    return rtn;
  } else {
    return `<span class='text-nowrap'>${rtn}</span>`;
  }
};

const smart_percentage = (min_precision, val, lang, options) => {
  const one_significant_figure_of_precision =
    val !== 0 &&
    Math.abs(val * 100) < 1 &&
    _.replace(val * 100, /(^.*\.)(0*[1-9]?)(.*)/, "$2").length;

  const max_precision = percent_formatter[lang].length - 1;

  const smart_precision = _.clamp(
    one_significant_figure_of_precision,
    min_precision,
    max_precision
  );

  const rtn = percent_formatter[lang][smart_precision].format(val);
  if (options.raw) {
    return rtn;
  } else {
    return `<span class='text-nowrap'>${rtn}</span>`;
  }
};

const types_to_format = {
  compact: (val, lang, options) =>
    compact(options.precision, val, lang, options),
  compact1: _.curry(compact)(1),
  compact2: _.curry(compact)(2),
  compact_written: (val, lang, options) =>
    compact_written(options.precision, val, lang, options),
  compact1_written: _.curry(compact_written)(1),
  compact2_written: _.curry(compact_written)(2),
  percentage: (val, lang, options) =>
    percentage(options.precision, val, lang, options),
  percentage1: _.curry(percentage)(1),
  percentage2: _.curry(percentage)(2),
  smart_percentage1: _.curry(smart_percentage)(1),
  smart_percentage2: _.curry(smart_percentage)(2),
  result_percentage: (val, lang) =>
    result_percent_formatter[lang].format(val / 100),
  result_num: (val, lang) => result_number_formatter[lang].format(val),
  decimal1: (val, lang, options) => number_formatter[lang][1].format(val),
  decimal2: (val, lang, options) => number_formatter[lang][2].format(val),
  decimal: (val, lang, options) => number_formatter[lang][3].format(val),
  big_int: (val, lang, options) => {
    const rtn = number_formatter[lang][0].format(val);

    if (options.raw) {
      return rtn;
    } else {
      return `<span class='text-nowrap'>${rtn}</span>`;
    }
  },
  int: (val) => val,
  ordinal: (val) => val,
  str: (val) => val,
  boolean: (val) => val,
  "wide-str": (val) => val,
  "short-str": (val) => val,
  date: (val) => val,
  dollar: (val, lang, options) => {
    options.precision = options.precision || 2;

    const rtn = money_formatter[lang][options.precision].format(val);

    if (options.raw) {
      return rtn;
    } else {
      return `<span class='text-nowrap'>${rtn}</span>`;
    }
  },
  year_to_fiscal_year: (year) => {
    const year_int = parseInt(year);
    return `${year_int}-${lang === "en" ? year_int - 2000 + 1 : year_int + 1}`;
  },
  fiscal_year_to_year: (fiscal_year) =>
    _.chain(fiscal_year).split("-").head().value(),
};

const formatter = (format, val, options) => {
  options = options || {};
  if (_.has(types_to_format, format)) {
    if (_.isArray(val)) {
      return _.map(val, (v) => formatter(format, v, options));
    } else if (_.isObject(val)) {
      return _.chain(val)
        .map((v, k) => [k, formatter(format, v, options)])
        .fromPairs()
        .value();
    } else if (_.isNaN(+val) && _.isString(val)) {
      return val;
    } else {
      return types_to_format[format](val, lang, options);
    }
  }
  return val;
};

// formats can be either an array of formats (of equal length to vals) or one format one which will be applied to all values
const list_formatter = (formats, vals) =>
  _.map(vals, (value, ix) =>
    !_.isArray(formats)
      ? formatter(formats[ix], value)
      : formatter(formats, value)
  );

const formats = _.chain(types_to_format)
  .keys()
  .flatMap((formatter_key) => [
    [
      formatter_key,
      (val, options = {}) => formatter(formatter_key, val, options),
    ],
    [
      `${formatter_key}_raw`,
      (val, options = {}) =>
        formatter(formatter_key, val, { ...options, raw: true }),
    ],
  ])
  .fromPairs()
  .value();

// the distinction of formatter vs list_formatter vs formats and how they deal with values vs lists of values is very tedious,
// I think this whole setup would be more usable if all formatters were standalone utils like this func. That cleanup's a TODO
const array_to_grammatical_list = (items) => {
  const and_et = {
    en: "and",
    fr: "et",
  }[lang];

  if (items.length === 1) {
    return items[0];
  } else if (items.length === 2) {
    return `${items[0]} ${and_et} ${items[1]}`;
  } else {
    return _.chain(items)
      .take(items.length - 1)
      .join(", ")
      .thru((list_fragment) => `${list_fragment}, ${and_et} ${_.last(items)}`)
      .value();
  }
};

export { formatter, list_formatter, formats, array_to_grammatical_list };
