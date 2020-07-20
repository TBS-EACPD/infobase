import { businessConstants } from "../models/businessConstants.js";
import { NA_color } from "../core/color_schemes.js";
import { formats } from "../core/format.js";

export const infobase_colors_smart = (col_scale) => (label) => {
  if (_.includes(businessConstants.NA_values, label)) {
    return NA_color;
  }
  return col_scale(label);
};

export const get_formatter = (
  is_money,
  formatter,
  raw = true,
  full = false
) => {
  if (_.isUndefined(formatter)) {
    if (!is_money) {
      return (value) => formats.big_int(value, { raw });
    } else {
      if (raw) {
        if (full) {
          return (value) => formats.dollar_raw(value);
        } else {
          return (value) => formats.compact2_raw(value);
        }
      } else {
        if (full) {
          return (value) => formats.dollar(value);
        } else {
          return (value) => formats.compact2(value);
        }
      }
    }
  } else {
    return (value) => (raw ? formatter(value, { raw }) : formatter(value));
  }
};
