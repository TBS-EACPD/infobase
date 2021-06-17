//  for properly formating numbers in multiple formats in both English and French
//  relates to the column type attribute as of the table class
//  site.scss also establishes the widths for displaying each of the data types
import _ from "lodash";

import { lang } from "src/core/injected_build_constants";

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
        currencyDisplay: "narrowSymbol",
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
        currencyDisplay: "narrowSymbol",
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

      const defined_compacted = _.filter(compacted, (pair) => {
        return !_.isUndefined(pair);
      });

      return defined_compacted.length! > 0 //have to use the ! because TS thinks filter can return null/
        ? defined_compacted[0]!
        : [abbrev[999][lang], val];
    }
  })();

  // for now, can't use the money formatter_wrapper if we want to insert
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

      const defined_compacted = _.filter(compacted, (pair) => {
        return !_.isUndefined(pair);
      });

      return defined_compacted[0]!;
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

export type FormatKey =
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
  | "big_int"
  | "dollar"
  | "year_to_fiscal_year"
  | "str"
  | "short-str"
  | "wide-str";
interface formatterOptions {
  raw: boolean;
  precision?: number;
}
const types_to_format: {
  [key in FormatKey]: (
    val: number,
    lang: LangType,
    options: formatterOptions
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
  // legacy hack, these are outliers but the Table API/report builder uses them... this code probably won't ever be reached,
  // values will probably be strings in these cases to the formatter_wrapper will swallow them (and use _.toString anyway)
  // ... these are here because they need to exist in the FormatKey type and the exported formats object
  str: _.toString,
  "short-str": _.toString,
  "wide-str": _.toString,
};

type Formattable =
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

const formatter_wrapper = (
  format: FormatKey,
  val: Formattable,
  options: formatterOptions
): Formatted<Formattable> => {
  const formatter = (actual_val: number | string) =>
    types_to_format[format](+actual_val as number, lang, options);

  if (typeof val === "object") {
    if (Array.isArray(val)) {
      return _.map(val, (v) => formatter(v));
    } else {
      return _.mapValues(val, (v) => formatter(v));
    }
  } else {
    return formatter(val);
  }
};

// legacy-ish hack here, two keys for every format, one with the suffix _raw that always has the option raw: true,
// one with no suffix that defaults to raw: false but can have that overwritten. Primarily because, at least historically
// the generated handlebar helper versions of formats don't take options (so needed an alternate way to set raw value).
// I think types in the legacy table definition API also use the _raw versions a lot
export const formats = _.chain(types_to_format)
  .keys()
  .flatMap((key: FormatKey) => [
    [
      key,
      (val: Formattable, options: Partial<formatterOptions> = {}) =>
        formatter_wrapper(key, val, { raw: false, ...options }),
    ],
    [
      `${key}_raw`,
      (val: Formattable, options: Partial<formatterOptions> = {}) =>
        formatter_wrapper(key, val, { ...options, raw: true }),
    ],
  ])
  .fromPairs()
  .value() as {
  // Important note, this is what the rest of src will see formats as. The other typing is just for internal consistency.
  // Little trick here too, unlike formatter_wrapper, we can actually lean on the generic nature of Formatted here, couldn't
  // in the actual formatter_wrapper type signature as it requires extending a type, which causes type uncertainty within the function body
  [key in FormatKey | `${FormatKey}_raw`]: <T extends Formattable>(
    val: T,
    options?: Partial<formatterOptions>
  ) => Formatted<T>;
};

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
