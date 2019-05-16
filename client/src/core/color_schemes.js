import * as color_defs from './color_defs.js'

const newIBCategoryColors = [
  "#206BBD",
  "#4abbc4",
  "#e8a840", 
  "#15918b", 
  "#a2d173", 
  "#7272D4", 
  color_defs.tertiaryColor, // grey
]

// for contrast against dark text
const newIBLightCategoryColors = [
  "#61A3EB",
  "#4abbc4",
  "#e8a840",
  "#a2d173", 
  "#8D98D3", 
  "#CCD3DB",
]

// for contrast against pale text
const newIBDarkCategoryColors = [
  "#195596",
  "#117078",
  "#8B5F18",
  "#1B793A",
  "#363687", 
  "#555B62", 
]

// sequential colour schemes
// dark text has sufficient contrast on the _last three_ colours only

const sequentialBlues = [
  "#206BBD",
  "#4C89CC",
  "#7BA8D9",
  "#B8CEE6",
  "#D1E7FF",
]

const sequentialReds = [
  "#DA3A38",
  "#DB5E5C",
  "#F78D8C",
  "#F7B6B4",
  "#FFD2D1",
]

const sequentialGreens = [
  "#62A123",
  "#87BF4F",
  "#A9D47D",
  "#CFE6B8",
  "#E8FFD1",
]

const sequentialPurples = [
  "#673C8F",
  "#9860CC",
  "#B68FD9",
  "#D0B8E6",
  "#E9D1FF",
]

// this is here instead of in color_defs.js because it's a data-dependent color
const NA_color = _.last(newIBCategoryColors); // color_defs.tertiaryColor

export {
  newIBCategoryColors,
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
  sequentialBlues,
  sequentialReds,
  sequentialGreens,
  sequentialPurples,
  NA_color,
};

// ***************************************************
// ***************** DO NOT USE **********************
// old infobase colour schemes kept here for posterity
// ***************************************************


//all colors from https://material.io/guidelines/style/color.html#color-color-palette
//you can use these colors as backgrounds for dark text (#222 or darker)
//organized to mirror d3 category10
const lightCategory10Colors = [
  '#9FA8DA', //indigo
  '#FB8C00', //amber
  '#66BB6A', //Green
  '#E57373',//red
  '#CE93D8', //purple
  '#BCAAA4', //brown
  '#F8BBD0', //pink
  '#9E9E9E', //grey
  '#CDDC39', //lime green
  '#18FFFF', //Cyan
];

//very closely based on category10, most are darkened a little bit to allow them to be used as accessible backgrounds for white text
const darkCategory10Colors = [
  "#1b679d", //blue
  "#1a7f84", //cyan-ish
  "#238023", //green
  "#c22424", //red
  "#8655b4", //purple
  "#8c564b", //brown
  "#bd2891", //pink
  "#757575", //grey
  "#e15814", //orange
  "#949438", //ugly puke green
];

//this is mostly d3.category10 with re-ordered colours, and replacing the base blue with the canada.ca header color
const infobaseCategory10Colors = [
  "#335075", //canada.ca header
  "#2ca02c", 
  "#ff7f0e", 
  "#9467bd",
  "#d62728", 
  "#17becf",
  "#8c564b", 
  "#e377c2", 
  "#7f7f7f", 
  "#bcbd22", 
];

//classic InfoBase graph colours, good for graphs with a limited number of items
const infobaseGraphColors = [ 
  '#005172', 
  '#3095B4', 
  '#37424A', 
  '#63CECA',
  '#CD202C', 
  '#CCDC00',
];

//this is (as of this writing) a straight copy of d3.category20
const infobaseCategory20Colors = [
  "#1f77b4", "#aec7e8",
  "#ff7f0e", "#ffbb78",
  "#2ca02c", "#98df8a",
  "#d62728", "#ff9896",
  "#9467bd", "#c5b0d5",
  "#8c564b", "#c49c94",
  "#e377c2", "#f7b6d2",
  "#7f7f7f", "#c7c7c7",
  "#bcbd22", "#dbdb8d",
  "#17becf", "#9edae5",
];
