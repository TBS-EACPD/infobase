import { scaleOrdinal } from "d3-scale";
import _ from "lodash";

import * as color_defs from "./color_defs.js";

const newIBCategoryColors = [
  "#206BBD", // blue
  "#4abbc4", // teal
  "#e89a40", // orange
  "#919bd4", // purple
  "#a2d173", // light green
  "#15918b", // dark teal
  color_defs.tertiaryColor, // grey
];

// for contrast against dark text
const newIBLightCategoryColors = [
  "#61A3EB", // blue
  "#4abbc4", // teal
  "#e8a840", // orange
  "#919bd4", // purple
  "#a2d173", // light green
  "#CCD3DB", // grey
];

// for contrast against pale text
const newIBDarkCategoryColors = [
  "#195596", // blue
  "#117078", // dark teal
  "#862552", // pink (replacing brown)
  "#554A9E", // purple
  "#1B793A", // green
  "#555B62", // grey
];

// sequential colour schemes
// dark text has sufficient contrast on the _last three_ colours only

const sequentialBlues = ["#D1E7FF", "#B8CEE6", "#7BA8D9", "#4C89CC", "#206BBD"];

const sequentialReds = ["#FFD2D1", "#F7B6B4", "#F78D8C", "#DB5E5C", "#DA3A38"];

const sequentialGreens = [
  "#D1FFE0",
  "#B8E6C7",
  "#7DD49A",
  "#4FBF74",
  "#23A14D",
];

const sequentialPurples = [
  "#E9D1FF",
  "#D0B8E6",
  "#B68FD9",
  "#9860CC",
  "#673C8F",
];

// this is here instead of in color_defs.js because it's a data-dependent color
const NA_color = _.last(newIBCategoryColors); // color_defs.tertiaryColor

const infobase_colors = (options) => scaleOrdinal().range(newIBCategoryColors);

export {
  newIBCategoryColors,
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
  sequentialBlues,
  sequentialReds,
  sequentialGreens,
  sequentialPurples,
  NA_color,
  infobase_colors,
};
