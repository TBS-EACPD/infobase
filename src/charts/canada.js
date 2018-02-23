"use strict";

const {provinces,
  provinces_short} = require('../models/businessConstants.js');

exports = module.exports;
/* 1,043 × 1010 style="opacity:0.65822784;fill:#000000;fill-opacity:1;stroke:none" width="94.350761" height="81.185539" */ // base map obtained from [here](http://commons.wikimedia.org/wiki/File:Canada_blank_map.svg) 
//
// data in the following format:
//  ```javascript
//  [ {"ON" : 1000, "QC": 2000, etc..}]
//  [ {"ON" : 1000, "QC": 2000, etc..}]
//  [ {"ON" : 1000, "QC": 2000, etc..}]
//  [ {"ON" : 1000, "QC": 2000, etc..}]
//  ```
//  with the data being assumed to be ordered by fiscal year
//

var D3CORE =  require("./core");

var ordering = {
  yt: 1,
  nt: 2,
  nu: 3,
  nl: 4,
  bc: 5,
  ab: 6,
  sk: 7,
  mb: 8,
  ON: 9,
  QC: 10,
  ncr: 11,
  nb: 12,
  ns: 13,
  pe: 14,
  abroad: 15,
  na: 15,
};

exports.canada = class canada {
  
  constructor(container,options){

    options.alternative_svg = D3CORE.templates("canada");
  
    D3CORE.setup_graph_instance(this,d4.select(container),options);
  };

  render(options){
    this.options = _.extend(this.options,options);

    var data = this.options.data;
    var formater = this.options.formater;
    var color_scale = this.options.color_scale;
    var last_year_data = _.last(data);
    var max_height = 700;
    var x_scale = this.outside_width/1396;
    var y_scale = max_height / 1346;
    var scale = Math.min(x_scale, y_scale);
    var height = scale * 1346;
    var padding = (this.outside_width - (scale * 1396)) /2;
    var html = this.html;
    var svg = this.svg;
    var graph_dispatcher = this.dispatch;
    var prev_prov;
    
    var dispatch_mouseLeave = function(){
      if (prev_prov) {
        svg.select("#CA-" + prev_prov)
          .styles({
            "stroke-width" : "2px",
            "stroke" : "#1f77b4",
          })
      }
      graph_dispatcher.call("dataMouseLeave");
    }
    
    var dispatch_mouseEnter = function(d) {
      if (prev_prov) {
        svg.select("#CA-" + prev_prov)
          .styles({
            "stroke-width" : "2px",
            "stroke" : "#1f77b4",
          })
      }

      if (!_.isUndefined(last_year_data[d[0]])){
        prev_prov = d[0];
  
        svg.select("#CA-" + d[0])
          .styles({
            "stroke-width" : "15px",
            "stroke" : "#1f77b4",
          })
  
        graph_dispatcher.call("dataMouseEnter","",d[0]);
      }
    };
    
    //remove the default svg node, it will be replaced from the template
    //set the html of the svg
    // append the second div element which will hold the bar graph

    svg = html.select("svg");


    svg
      .attrs({
        "height" :  height +"px",
        "width" :  this.outside_width +"px",
      });

    svg.select(".container")
      .attr("transform","translate("+padding+",0),scale("+scale+")");

    svg.selectAll("."+ window.lang +"-only")
      .styles({
        "opacity" : "1",
      })

    svg.selectAll(".province")
      .each(function(d){
        var that = d4.select(this);
        var prov = that.attr("id").split("-")[1];
        d4.select(this).datum([prov,undefined]);
      })
      .styles({
        "fill" : "#1f77b4",
        "fill-opacity" : function(d,i){
          var prov = d4.select(this).attr("id").replace("CA-","");
          var val = last_year_data[prov];
          return color_scale(val || 0);
        },
        "stroke-width" : "2px",
        "stroke" : "#1f77b4",
        "stroke-opacity" : function(d,i){
          var prov = d4.select(this).attr("id").replace("CA-","");
          var val = last_year_data[prov];
          return color_scale(val || 0);
        },
      })
      .on("mouseenter", dispatch_mouseEnter)
      .on("mouseleave", dispatch_mouseLeave);

    if(_.filter(data, function(d){return d.abroad}).length === 0){
      svg.selectAll(".province#CA-abroad")
        .styles({
          "visibility" : "hidden",
        })
    }
    
    if(_.filter(data, function(d){return d.na}).length === 0){
      svg.selectAll(".province#CA-na")
        .styles({
          "visibility" : "hidden",
        })
    } 

    if(_.filter(data, function(d){return d.pe}).length === 0){
      svg.selectAll("path#CA-pe-Marker")
        .styles({
          "visibility" : "hidden",
        })
    }
    
    if(_.filter(data, function(d){return d.ns}).length === 0){
      svg.selectAll("path#CA-ns-Marker")
        .styles({
          "visibility" : "hidden",
        })
    } 
    
    if(_.filter(data, function(d){return d.nb}).length === 0){
      svg.selectAll("path#CA-nb-Marker")
        .styles({
          "visibility" : "hidden",
        })
    } 
    
    if(_.filter(data, function(d){return d.ncr}).length === 0){
      svg.selectAll("path#CA-ncr-Marker")
        .styles({
          "visibility" : "hidden",
        })
    } 
    

    html.selectAll("div.label")
      .data( _.chain(last_year_data)
        .toPairs()
        .sortBy(function(d){
          return ordering[d[0]];
        })
        .value())
      .enter()
      .append("div")
      .order()
      .attr("class","label")
      .attr("tabindex", 0)
      .on("mouseenter", dispatch_mouseEnter)
      .on("focus", dispatch_mouseEnter)
      .on("mouseleave", dispatch_mouseLeave)
      .on("blur", dispatch_mouseLeave)
      .each(function(d,i){
        var prov = d[0];
        var label = svg.selectAll("g.label").filter(function(){
          return d4.select(this).attr("id").replace("label-","") === prov;
        });
        var coords = label.attr("transform")
          .replace(/(translate\(|\)|)/g,"")
          .replace(","," ")
          .split(" ");

        d4.select(this)
          .styles({
            "border-radius" : "5px",
            "position" : "absolute",
            "left" : padding+scale*coords[0]+"px",
            "top" : scale*coords[1]+"px",
            "text-align": "center",
            "font-size" : "10px",
            "min-width" : scale*110+"px",
            "min-height" : "35px",
            "height" : scale*80+"px",
            "background-color" : "#CCC",
          }); 

        var provName = prov; //Default, uses prov code
        if (prov === 'ON' || prov === 'QC') {
          prov += "lessncr";
        }
        if (provinces[prov] && (scale > 0.5)) {
          //If the graph is large enough and the full name is defined, use full name
          provName = provinces[prov].text; 
        } else if (provinces_short[prov] && (scale < 0.5)) { 
          //If the graph is too small and the short name is defined, use short name. Basically bilingual prov codes
          provName = provinces_short[prov].text; 
        }
        
        d4.select(this)
          .append("div")
          .html(provName);


        d4.select(this)
          .append("a")
          .attr('tabindex',-1)
          .styles({
            "color" : "black",
            "text-decoration" : "none",
          })
          .html(formater(d[1]))
      });
  };
}
