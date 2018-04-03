"use strict";
var common_charts_utils = require('./common_charts_utils');

var heatmap = function(container,options){


  d3.select(container).select('*').remove();

  common_charts_utils.setup_graph_instance(this,d3.select(container),options);
  this.graph_area  = this.svg.append("g").attr("class","_graph_area");
  this.inner_graph_area = this.graph_area.append("g").attr("class","inner_graph_area");
  // recorded in RGB format for easy sharing between SVG and HTML
  this.pos_color = "23,147,23"; 
  this.neg_color = "184,28,28";
};

heatmap.prototype.render = function(options){
  // data in the format of
  // ```javascript
  // data = [
  //  { x : val, 
  //    y: val,
  //    z : val
  //  },
  //  { x : val, 
  //    y: val,
  //    z : val
  //  },
  //
  // ];
  // x_vals = [] sorted from left-right
  // y_vals = [] sorted from bottom-top
  // ```
  this.inner_graph_area.select('*').remove();

  this.options = _.extend(this.options,options);

  // leave larger margins on the top and left for the y/x axis
  // labels
  var margin = this.options.margin || {top: 50,
    right: 20,
    bottom: 30,
    left: 100};

  var width = this.outside_width - margin.left - margin.right;
  var height = this.outside_height - margin.top - margin.bottom;

  var graph_dispatcher = this.dispatch;

  var hover_formatter = this.options.hover_formatter;
  var data = this.options.data;
  var pos_color_scale = this.options.pos_color_scale;
  var neg_color_scale = this.options.neg_color_scale;
  var pos_color = this.pos_color;
  var neg_color = this.neg_color;
  var x_values = this.options.x_values;
  var y_values = this.options.y_values;
  var x_y_lookup = function(x,y){
    return _.find(data, function(row){
      return row.x === x && row.y === y;
    });
  };
  var x_y_cross = _.chain(x_values)
    .map(function(x){
      return _.map(y_values, function(y){
        return x_y_lookup(x,y) || {
          x : x,
          y : y,
          z : undefined,
        };
      })
    })
    .flatten(true)
    .value();

  var x_scale = d3.scaleBand()
    .domain(x_values)
    .rangeRound([0,width])
    .padding(0);

  var y_scale = d3.scaleBand()
    .domain(y_values)
    .rangeRound([height,0])
    .padding(0);

  this.svg.style("display", "none");
  
  var html_graph_area = this.html
    .append('div')
    .styles({
      position:'relative', 
      height: height+'px', 
      width: width+'px',
      top:margin.top+'px', 
      left:margin.left+'px',
    })
  
  var y_labels = this.html
    .selectAll("div.y-label")
    .data(y_values)

  y_labels.exit().remove();

  const new_y_labels = y_labels
    .enter()
    .append("div")
    .classed("y-label",true)

  y_labels.merge(new_y_labels)
    .styles({
      "width" : margin.left + "px",
      "height" : y_scale.bandwidth() + "px",
      "position" : "absolute",
      "top" : function(d){
        return y_scale(d)+ margin.top+"px" ;
      },
      "text-align" : "right",
      "border-bottom" : "1px solid #ccc",
    })
    .append("div")
    .styles({
      "font-size" : "10px" ,
      "font-weight" : "500",
      "position": "relative",
      "left" : "-10px",
      "top": "50%",
      "transform": "translateY(-50%)",
    })
    .html(function(d){
      return d;
    });

  var x_labels = this.html
    .selectAll("div.x-label")
    .data(x_values)

  x_labels.exit().remove();

  const new_x_labels = x_labels
    .enter()
    .append("div")
    .classed("x-label",true)

  x_labels.merge(new_x_labels)
    .styles({
      "width" : x_scale.bandwidth() + "px",
      "height" : margin.top + "px",
      "position" : "absolute",
      "left" : function(d){
        return margin.left + x_scale(d)+"px" ;
      },
      "top" : "0px",
      "border-right" : "1px solid #ccc",
      "text-align" : "center",
    })
    .append("div")
    .styles({
      "font-size" : "10px" ,
      "font-weight" : "500",
      "position": "relative",
      "bottom" : "0px",
    })
    .html(function(d){
      return d;
    });


  var cells = html_graph_area.
    selectAll('div.cell')
    .data(x_y_cross);

  cells.exit().remove();

  const new_cells = cells
    .enter()
    .append('div')
    .classed('cell',true)

  cells.merge(new_cells)
    .styles({
      'position':'absolute',
      'left':function(d){ return  x_scale(d.x)+'px'},
      'top': function(d){ return  y_scale(d.y)+'px'},
      "border" : "1px solid #ccc",
      "background": function(d){
        // debugger;
        if (d.z === undefined){
          return "#FFF";
        } else if (d.z >0) {
          return "rgba("+pos_color+","+pos_color_scale(d.z)+")"; 
        } else {
          return "rgba("+neg_color+","+neg_color_scale(d.z)+")" ;
        }
      },
      "width" : x_scale.bandwidth()+'px',
      "height" : y_scale.bandwidth()+'px',
      'line-height':y_scale.bandwidth()+'px',
      'vertical-align':'middle',
      'text-align':'center',
    })
    .attrs({
      "class": 'heatmap-square',
    })
    .filter(function(d){
      return d.z !== undefined;
    })
    .on('click', function(d){
      graph_dispatcher.call("dataClick","",this,d);
    })
    .on('mouseenter',function(d){
      d3.select(this)
        .classed('hover',true)
        .html(function(d){return hover_formatter(d.z)});
      graph_dispatcher.call("dataMouseEnter",this,d);
    }) 
    .on('mouseout',function(d){
      d3.select(this)
        .classed('hover',false)
        .html('');
      graph_dispatcher.call("dataMouseLeave",this,d);
    })
       
  return this;
};


exports = module.exports;
module.exports.heatmap= heatmap;
