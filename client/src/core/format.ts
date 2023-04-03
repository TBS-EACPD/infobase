//  for properly formating numbers in multiple formats in both English and French
//  relates to the column type attribute as of the table class
//  site.scss also establishes the widths for displaying each of the data types
import _ from "lodash";

import { lang, is_a11y_mode } from "src/core/injected_build_constants";

const number_formatter = {
  en: _.map(
    _.range(4),
    (ix) =>
      new Intl.NumberFormat("en-CA", {
        style: "decimal",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
  fr: _.map(
    _.range(4),
    (ix) =>
      new Intl.NumberFormat("fr-CA", {
        style: "decimal",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
};
const money_formatter = {
  en: _.map(
    _.range(3),
    (ix) =>
      new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
  fr: _.map(
    _.range(3),
    (ix) =>
      new Intl.NumberFormat("fr-CA", {
        style: "currency",
        currency: "CAD",
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
};
const percent_formatter = {
  en: _.map(
    _.range(4),
    (ix) =>
      new Intl.NumberFormat("en-CA", {
        style: "percent",
        minimumFractionDigits: ix,
        maximumFractionDigits: ix,
      })
  ),
  fr: _.map(
    _.range(4),
    (ix) =>
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

const compact = (
  precision: number,
  val: number,
  lang: LangType,
  raw: boolean
) => {
  const abbrev: { [key: number]: LangDict<string> } = {
    1000000000: { en: "B", fr: "G" },
    1000000: { en: "M", fr: "M" },
    1000: { en: "K", fr: "k" },
    999: { en: "", fr: "" },
  };

  const abs = Math.abs(val);
  const [symbol, new_val] = ((): [string, number] => {
    if (val === 0) {
      return ["", 0];
    } else {
      const compacted: ([string, number] | undefined)[] = _.times(3, (i) => {
        //can't break out of a lodash loop
        const breakpoint = 1000000000 / Math.pow(10, i * 3); //checking 1B, 1M, and 1K
        if (abs >= breakpoint) {
          return [abbrev[breakpoint][lang], val / breakpoint];
        }
      });

      const defined_compacted = _.reject(
        compacted,
        (pair) => _.isUndefined(pair)
      );
      const defined_compact_val = defined_compacted[0];

      if (!_.isUndefined(defined_compact_val)) {
        return defined_compact_val;
      } else {
        return [abbrev[999][lang], val];
      }
    }
  })();

  // for now, can't use the money format_wrapper if we want to insert
  // custom symbols in the string. There is an experimental
  // formatToParts function that may be useful in the future
  const rtn = number_formatter[lang][precision].format(new_val);
  const compactStr = !symbol ? rtn : `${rtn} ${symbol}`;

  if (raw) {
    return lang === "fr" ? `${compactStr}$` : `$${compactStr}`;
  } else {
    return lang === "fr"
      ? `<span class='text-nowrap'>${compactStr}$</span>`
      : `<span class='text-nowrap'>$${compactStr}</span>`;
  }
};

const compact_written = (
  precision: number,
  val: number,
  lang: LangType,
  raw: boolean
) => {
  // the rules for this are going to be different from compact(),
  // emphasizing readability.
  // specifically, small numbers are treated differently

  const abbrevs: { [keys: number]: LangDict<string> } = {
    1000000000: { en: " billion", fr: " milliards" },
    1000000: { en: " million", fr: " millions" },
    1000: { en: " thousand", fr: " milliers" },
    999: { en: "", fr: "" },
  };

  const abs = Math.abs(val);

  const [rtn, abbrev] = ((): [string, string] => {
    if (abs >= 50000) {
      const compacted: ([string, string] | undefined)[] = _.times(3, (i) => {
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

      const defined_compacted = _.reject(compacted, (pair) => {
        return _.isUndefined(pair);
      });

      // ... this code is a real pile of crap. Refactor a TODO, in the meantime just wanted to note that the pre-TS code assumed
      // this would never return undefined, so encoding that assumption in the types here
      // ...not that I trust this code further than I can throw an error
      return defined_compacted[0] as [string, string];
    } else {
      precision = precision < 2 ? 0 : precision;
      return [
        number_formatter[lang][precision].format(val),
        abbrevs[999][lang],
      ];
    }
  })();

  if (raw) {
    return lang === "fr" ? `${rtn}${abbrev} de dollars` : `$${rtn}${abbrev}`;
  } else {
    return lang === "fr"
      ? `<span class='text-nowrap'>${rtn}${abbrev}</span> de dollars`
      : `<span class='text-nowrap'>$${rtn}</span>${abbrev}`;
  }
};

const percentage = (
  precision: number,
  val: number,
  lang: LangType,
  raw: boolean
) => {
  const rtn = percent_formatter[lang][precision].format(val);
  if (raw) {
    return rtn;
  } else {
    return `<span class='text-nowrap'>${rtn}</span>`;
  }
};

const smart_percentage = (
  min_precision: number,
  val: number,
  lang: LangType,
  raw: boolean
) => {
  const one_significant_figure_of_precision =
    val !== 0 && Math.abs(val * 100) < 1
      ? _.replace(_.toString(val * 100), /(^.*\.)(0*[1-9]?)(.*)/, "$2").length
      : 0;

  const max_precision = percent_formatter[lang].length - 1;

  const smart_precision = _.clamp(
    one_significant_figure_of_precision,
    min_precision,
    max_precision
  );

  const rtn = percent_formatter[lang][smart_precision].format(val);
  if (raw) {
    return rtn;
  } else {
    return `<span class='text-nowrap'>${rtn}</span>`;
  }
};

type NumberFormatKey =
  | "compact"
  | "compact1"
  | "compact2"
  | "compact_written"
  | "compact1_written"
  | "compact2_written"
  | "percentage"
  | "percentage1"
  | "percentage2"
  | "smart_percentage1"
  | "smart_percentage2"
  | "result_percentage"
  | "result_num"
  | "decimal1"
  | "decimal2"
  | "decimal"
  | "int"
  | "big_int"
  | "dollar"
  | "year_to_fiscal_year";

interface FormatterOptions {
  raw: boolean;
  precision?: number;
}

const types_to_format: {
  [key in NumberFormatKey]: (
    val: number,
    lang: LangType,
    options: FormatterOptions
  ) => string;
} = {
  compact: (val, lang, { raw, precision = 0 }) =>
    compact(precision, val, lang, raw),
  compact1: (val, lang, { raw }) => compact(1, val, lang, raw),
  compact2: (val, lang, { raw }) => compact(2, val, lang, raw),
  compact_written: (val, lang, { raw, precision = 0 }) =>
    compact_written(precision, val, lang, raw),
  compact1_written: (val, lang, { raw }) => compact_written(1, val, lang, raw),
  compact2_written: (val, lang, { raw }) => compact_written(2, val, lang, raw),
  percentage: (val, lang, { raw, precision = 0 }) =>
    percentage(precision, val, lang, raw),
  percentage1: (val, lang, { raw }) => percentage(1, val, lang, raw),
  percentage2: (val, lang, { raw }) => percentage(2, val, lang, raw),
  smart_percentage1: (val, lang, { raw }) =>
    smart_percentage(1, val, lang, raw),
  smart_percentage2: (val, lang, { raw }) =>
    smart_percentage(2, val, lang, raw),
  result_percentage: (val, lang) =>
    result_percent_formatter[lang].format(val / 100),
  result_num: (val, lang) => result_number_formatter[lang].format(val),
  decimal1: (val, lang) => number_formatter[lang][1].format(val),
  decimal2: (val, lang) => number_formatter[lang][2].format(val),
  decimal: (val, lang) => number_formatter[lang][3].format(val),
  int: (val) => _.toString(val),
  big_int: (val, lang, { raw }) => {
    const rtn = number_formatter[lang][0].format(val);

    if (raw) {
      return rtn;
    } else {
      return `<span class='text-nowrap'>${rtn}</span>`;
    }
  },
  dollar: (val, lang, { raw, precision = 2 }) => {
    const rtn = money_formatter[lang][precision].format(val);

    if (raw) {
      return rtn;
    } else {
      return `<span class='text-nowrap'>${rtn}</span>`;
    }
  },
  year_to_fiscal_year: (val) => {
    return `${val}-${lang === "en" ? val - 2000 + 1 : val + 1}`;
  },
};

export type Formattable =
  | number
  | string
  | (number | string)[]
  | { [key: string]: number | string };
type Formatted<T> = T extends number | string
  ? string
  : T extends (number | string)[]
  ? string[]
  : T extends { [key: string]: number | string }
  ? { [key: string]: string }
  : never;

function format_wrapper<T extends Formattable>(
  format: NumberFormatKey,
  val: T,
  options: FormatterOptions
): Formatted<T>;
function format_wrapper(
  format: NumberFormatKey,
  val: Formattable,
  options: FormatterOptions
): Formatted<Formattable> {
  const formatter = (actual_val: number | string) =>
    _.isNumber(actual_val) || (_.isString(actual_val) && !_.isNaN(+actual_val))
      ? types_to_format[format](+actual_val as number, lang, options)
      : _.toString(actual_val); // TODO would prefer to throw in this case, but some legacy code likely depends on this. Check

  if (_.isObject(val)) {
    if (Array.isArray(val)) {
      return _.map(val, (v) => formatter(v));
    } else {
      return _.mapValues(val, (v) => formatter(v));
    }
  } else {
    return formatter(val);
  }
}

const number_formats = _.chain(types_to_format)
  .keys()
  .flatMap((key: NumberFormatKey) => [
    // legacy-ish hack here, two keys for every format, one with the suffix _raw that always has the option raw: true,
    // one with no suffix that defaults to raw: false but can have that overwritten. Primarily because, at least historically
    // the generated handlebar helper versions of formats don't take options (so needed an alternate way to set raw value).
    // I think types in the legacy table definition API also use the _raw versions a lot
    [
      key,
      (val: Formattable, options: Partial<FormatterOptions> = {}) =>
        format_wrapper(key, val, { raw: false, ...options }),
    ],
    [
      `${key}_raw`,
      (val: Formattable, options: Partial<FormatterOptions> = {}) =>
        format_wrapper(key, val, { ...options, raw: true }),
    ],
  ])
  .fromPairs()
  .value() as {
  [key in NumberFormatKey | `${NumberFormatKey}_raw`]: <T extends Formattable>(
    val: T,
    options?: Partial<FormatterOptions>
  ) => Formatted<T>;
};

// legacy, exist primarily for the Table API/RPB, where columns may have these types and expec a corresponding format to exist (but do nothing)
// TODO either before or after the Table API is dropped/the RPB is refactored, remove these
const legacy_string_format_keys = ["str", "short-str", "wide-str"] as const;
type LegacyStringNumberFormatKeys = typeof legacy_string_format_keys[number];
const legacy_string_formats = _.chain(legacy_string_format_keys)
  .flatMap((key) => [
    [key, _.identity],
    [`${key}_raw`, _.identity],
  ])
  .fromPairs()
  .value() as {
  [key in
    | LegacyStringNumberFormatKeys
    | `${LegacyStringNumberFormatKeys}_raw`]: <T extends Formattable>(
    value: T
  ) => T;
};

export const formats = { ...number_formats, ...legacy_string_formats };
export type FormatKey = [keyof typeof formats][number];

export const array_to_grammatical_list = (items: string[]) => {
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

// TODO legacy; at a minimum it needs a much clearer API, or even a full deprecation. This encapsualtes some old "smart" logic for determining the
// appropriate formatter for a given value (although it has to be cued on whether it's "money"). Widley used in charts, at least historically
export const get_formatter = (
  is_money: boolean,
  formatter?: typeof formats[FormatKey],
  raw = true,
  full = false
) => {
  if (_.isUndefined(formatter)) {
    if (!is_money) {
      return (value: Formattable) => formats.big_int(value, { raw });
    } else {
      if (raw) {
        if (full) {
          return (value: Formattable) => formats.dollar_raw(value);
        } else {
          return (value: Formattable) =>
            is_a11y_mode
              ? formats.compact2_written_raw(value)
              : formats.compact2_raw(value);
        }
      } else {
        if (full) {
          return (value: Formattable) => formats.dollar(value);
        } else {
          return (value: Formattable) =>
            is_a11y_mode
              ? formats.compact2_written_raw
              : formats.compact2(value);
        }
      }
    }
  } else {
    return (value: Formattable) =>
      raw ? formatter(value, { raw }) : formatter(value);
  }
};
