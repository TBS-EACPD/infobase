import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";

import { NA_color } from "src/core/color_schemes";

import type { FormatKey, Formattable } from "src/core/format";
import { formats } from "src/core/format";

import { is_a11y_mode } from "src/core/injected_build_constants";

export const infobase_colors_smart = (col_scale: any) => (label: any) => {
  if (_.includes(businessConstants.NA_values, label)) {
    return NA_color;
  }
  return col_scale(label);
};

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
