import { businessConstants } from '../models/businessConstants.js';
import { NA_color } from '../core/color_schemes.js';
import { formats, dollar_formats } from "../core/format.js";

export const infobase_colors_smart = (col_scale) => (label) => {
  if ( _.includes(businessConstants.NA_values,label) ){
    return NA_color;
  }
  return col_scale(label);
};



export const get_formatter = (is_money, formatter, raw = true) => (
  _.isUndefined(formatter) ?
    ( 
      !is_money ? 
        (value) => formats.big_int(value, {raw}) :
        (
          raw ? 
            (value) => dollar_formats.compact2_raw(value) : 
            (value) => formats.compact2(value)
        )
    ) :
    ((value) => raw ? formatter(value, {raw: true}) : formatter(value))
);