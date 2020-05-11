import { businessConstants } from "../models/businessConstants.js";
import { NA_color } from "../core/color_schemes.js";
import { formats } from "../core/format.js";

export const infobase_colors_smart = (col_scale) => (label) => {
  if (_.includes(businessConstants.NA_values, label)) {
    return NA_color;
  }
  return col_scale(label);
};

export const get_formatter = (is_money, formatter, raw = true, full = false) =>
  _.isUndefined(formatter)
    ? !is_money
      ? (value) => formats.big_int(value, { raw })
      : raw
      ? full
        ? (value) => formats.dollar_raw(value)
        : (value) => formats.compact2_raw(value)
      : full
      ? (value) => formats.dollar(value)
      : (value) => formats.compact2(value)
    : (value) => (raw ? formatter(value, { raw: true }) : formatter(value));
