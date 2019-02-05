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

export {
  lightCategory10Colors,
  darkCategory10Colors,
  infobaseCategory10Colors,
  infobaseGraphColors,
  infobaseCategory20Colors,
};

