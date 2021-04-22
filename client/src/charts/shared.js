import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";

import { NA_color } from "src/core/color_schemes.js";

import { formats } from "src/core/format.js";

import { is_a11y_mode } from "src/core/injected_build_constants";

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
          return (value) =>
            is_a11y_mode
              ? formats.compact2_written_raw(value)
              : formats.compact2_raw(value);
        }
      } else {
        if (full) {
          return (value) => formats.dollar(value);
        } else {
          return (value) =>
            is_a11y_mode
              ? formats.compact2_written_raw
              : formats.compact2(value);
        }
      }
    }
  } else {
    return (value) => (raw ? formatter(value, { raw }) : formatter(value));
  }
};
