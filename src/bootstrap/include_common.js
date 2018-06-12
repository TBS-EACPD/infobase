//this file's responsibility is to pull in most globals

module.exports = exports = {};

require('./include_basic_dependencies.js');
require('../../external-dependencies/textencoder-lite.min.exec.js');
require('../../external-dependencies/pako_inflate.min.exec.js');
require('../../external-dependencies/typeahead.min.exec.js');
require('../../external-dependencies/tooltip.exec.js');
require('../../external-dependencies/jquery-ui-focusable-tabbable.exec.js');


//dev helper globals 
window._classnames = require('classnames');
window._Subject = require("../models/subject");


require("../tables/table_common");

require("../handlebars/helpers");

//this is mostly d3.category10 with re-ordered colours, and replacing the base blue with the canada.ca header color
const colors = [
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

//all colors from https://material.io/guidelines/style/color.html#color-color-palette
//you can use these colors as backgrounds for dark text (#222 or darker)
//organized to mirror d3 category10
window.lightCategory10Colors = [
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
window.darkCategory10Colors = [
  "#1b679d", //blue
  "#1a7f84", //cyan-ish
  "#238023", //green
  "#c22424", //red
  "#8655b4", //purple
  "#8c564b", //brown
  "#bd2891", //pink
  "#757575",
  "#e15814", //orange
  "#949438", //ugly puke green
];


window.infobase_colors = () => d3.scaleOrdinal().range(colors);

