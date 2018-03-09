"use strict";
exports = module.exports;

var common_charts_utils = require('./common_charts_utils');

exports.circle_pie_chart = class circle_pie_chart {
  
  constructor(container,options){
    // data in the format of
    // ```javascript
    // data = { "series 1" : [y1,y2,y3],
    //         "series 2" : [y1,y2,y3]}
    // ticks = ["tick1","tick2"."tick3"]
    // ```
    common_charts_utils.setup_graph_instance(this,d3.select(container),options);
    this.graph_area =  this.svg.append("g").attr("class","_graph_area");
  };

  render(options){
    this.options = _.extend(this.options,options);
    var margin = this.options.margin || {top: 50,
      right: 10,
      bottom: 20,
      left: 10};
    var hide_labels = this.options.hide_labels;
    var colors = this.options.colors || common_charts_utils.tbs_color();
    var centre = this.options.centre || false;
    var width = this.outside_width - margin.left - margin.right;
    var height = this.outside_height - margin.top - margin.bottom;
    var min_dim = Math.min(height, width);
    var formater = this.options.formater || _.identity;
    var font_size = this.options.font_size || 16;
    var title = this.options.title;
    var data = this.options.data;
    // based on the min dimension of the pane
    var scale = d3.scalePow()
      .exponent(0.5)
      .domain([1,d3.max(data, function(d){return d.value;})])
      .range([1,min_dim/2]);
    var x_offset = (margin.left + width/2);

    this.svg
      .attr("width", width+margin.left+margin.right)
      .attr("height", height+margin.bottom+margin.top)
    this.graph_area
      .attr("transform", "translate(" + x_offset + "," + margin.top + ")");

    if (title) {
      this.html.append("div")
        .attr("class", "title center-text")
        .styles({
          "font-size" : font_size + "px",
          "position" : "absolute",
          "font-weight" : "500",
          "left": margin.left+"px",
          "top": "0px",
          "width" : width+"px",
        })
        .append("div")
        .styles({"width": "80%","margin" : "auto"})
        .html(title);
    }

    // join the filtered data to the circles
    var circles = this.graph_area
      .selectAll("circle")
      .data(data,function(d){ return d.name;});

    // join the filtered data to any divs with labels
    circles.exit().remove();

    const new_circles = circles
      .enter()
      .append("circle")
      .on("mouseenter", this.dispatch.on("dataMouseEnter"))
      .on("mouseleave", this.dispatch.on("dataMouseLeave"))
      .on("click", this.dispatch.on("dataClick"));

    circles.merge(new_circles)
      .attrs({
        "cy": function(d,i) {
          if (centre && i > 0){
            return scale(data[0].value);
          } else {
            return scale(d.value);
          }
        },
        "cx": "0px",
        "r" : function(d) { return  scale(d.value); },
      })
      .styles({
        "fill" : function(d,i){ return colors(d.name);},
        "fill-opacity" : function(d,i){
          return i === 0 ? 0.5 : 1;
        },
        "stroke" : function(d,i){ return colors(d.name);},
        "stroke-width" : "2px",
        "stroke-opacity" : function(d,i){
          return i === 0 ? 0.3 : 0.8;
        },
      });

    var text = this.html
      .selectAll("div.middletext")
      .data(data,function(d){ return d.name;});

    text.exit().remove();

    const new_text = text
      .enter()
      .append("div");

    text.merge(new_text)
      .html(function(d){ return formater(d.value);})
      .styles({
        "text-align": "center",
        "position" : "absolute",
        "font-weight" : "500",
        "font-size" : font_size + "px",
        "width" : width+"px",
        "top"  : function(d,i){
          if (i === 0 && data.length === 2) {
            // the containing circle, the text should be located below
            return margin.top +min_dim+"px";
          } else if (centre ||( i === 0 && data.length === 1)){
            return margin.top + scale(data[0].value)-font_size+"px";
          } else {
            // the contained circle, the text should be located below
            return margin.top+scale(d.value)+"px";
          }},
        "left"  : margin.left+"px",
      })
      .classed('wb-inv', hide_labels); 

    return this;
  };
}
