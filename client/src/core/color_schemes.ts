import { scaleOrdinal } from "d3-scale";

const newIBCategoryColors = [
  "#206BBD", // blue
  "#4abbc4", // teal
  "#e89a40", // orange
  "#919bd4", // purple
  "#a2d173", // light green
  "#15918b", // dark teal
  "#8c949e", // grey
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

const infobase_colors = () => scaleOrdinal().range(newIBCategoryColors);

export {
  newIBCategoryColors,
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
  sequentialBlues,
  sequentialReds,
  sequentialGreens,
  sequentialPurples,
  infobase_colors,
};
