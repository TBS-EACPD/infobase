import * as color_defs from './color_defs.js'

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


const newIBCategoryColors = [
  "#206BBD", // main blue
  "#4abbc4", // green
  "#e8a840", // purple
  "#15918b", // teal
  "#a2d173", // yellow
  "#7272D4", // purplish blue
  "#8C949E", // grey
]

// for contrast against dark text
const newIBLightCategoryColors = [
  "#61A3EB", // main blue
  "#4abbc4", // green
  "#e8a840", // purple
  "#a2d173", // yellow
  "#8D98D3", // purplish blue
  "#CCD3DB", // grey
]

// for contrast against pale text
const newIBDarkCategoryColors = [
  "#195596", // main blue
  "#1B793A", // green
  "#673C8F", // purple
  "#117078", // teal
  "#8B6E18", // yellow
  "#363687", // purplish blue
  "#66712D", // yellow-green
  "#555B62", // grey
]

const get_IB_category_colors = (options) => {
  let main_colors, negative, na;
  if(_.get(options,'pale')){
    main_colors = [...newIBLightCategoryColors];
  } else if(_.get(options,'dark')){
    main_colors = [...newIBDarkCategoryColors];
  } else {
    main_colors = [...newIBCategoryColors];
  }

  if(_.get(options,'negative')){
    main_colors.splice(2); // remove green if we're including red
    if(_.get(options,'pale')){
      negative = color_defs.highlightPale;
    } else if(_.get(options,'dark')){
      negative = color_defs.highlightDark;
    } else {
      negative = color_defs.highlightColor;
    }
  }

  if(_.get(options,'na')){
    main_colors.splice(main_colors.length-1); // remove grey if we're including NA
    if(_.get(options,'pale')){
      na = _.last(newIBLightCategoryColors);
    } else if(_.get(options,'dark')){
      na = _.last(newIBDarkCategoryColors);
    } else {
      na = _.last(newIBCategoryColors);
    }
  }

  return {
    main: main_colors,
    negative: _.get(options,'negative') && negative,
    na: _.get(options,'na') && na,
  }
}


export {
  lightCategory10Colors,
  darkCategory10Colors,
  infobaseCategory10Colors,
  infobaseGraphColors,
  infobaseCategory20Colors,
  newIBCategoryColors,
  newIBLightCategoryColors,
  get_IB_category_colors,
};

