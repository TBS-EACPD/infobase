import { businessConstants } from '../models/businessConstants.js';
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

import common_charts_utils from "./common_charts_utils";
import { canada_svg } from "./canada.yaml";

const { provinces, provinces_short } = businessConstants;
const canada_svg_text = canada_svg.text;

const ordering = {
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

export class Canada {
  
  constructor(container, options){

    options.alternative_svg = canada_svg_text;
  
    common_charts_utils.setup_graph_instance(this, d3.select(container), options);
  };

  render(options){
    this.options = _.extend(this.options, options);

    const x_scale_factor = 1396;
    const y_scale_factor = 1346;

    var data = this.options.data;
    var formater = this.options.formater;
    var color_scale = this.options.color_scale;
    var last_year_data = _.last(data);
    var max_height = 700;
    var x_scale = this.outside_width / x_scale_factor;
    var y_scale = max_height / y_scale_factor;
    var scale = Math.min(x_scale, y_scale);
    var height = scale * y_scale_factor;
    var padding = ( this.outside_width - (scale * x_scale_factor) ) / 2;
    var html = this.html;
    var svg = this.svg;
    var graph_dispatcher = this.dispatch;
    var prev_prov;
    
    var dispatch_mouseLeave = function(){
      if (prev_prov) {
        svg.select(`#CA-${prev_prov}`)
          .styles({
            "stroke-width": "2px",
            stroke: "#1f77b4",
          })
      }
      graph_dispatcher.call("dataMouseLeave");
    }
    
    var dispatch_mouseEnter = function(d) {
      if (prev_prov) {
        svg.select(`#CA-${prev_prov}`)
          .styles({
            "stroke-width": "2px",
            stroke: "#1f77b4",
          })
      }

      if ( !_.isUndefined(last_year_data[ d[0] ]) ){
        prev_prov = d[0];
        svg.select(`#CA-${d[0]}`)
          .styles({
            "stroke-width": (d[0]==="abroad" || d[0]==="na") ? "8px" : "15px",
            stroke: "#1f77b4",
          })
  
        graph_dispatcher.call("dataMouseEnter", "", d[0]);
      }
    };
    
    //remove the default svg node, it will be replaced from the template
    //set the html of the svg
    // append the second div element which will hold the bar graph

    svg = html.select("svg");


    svg
      .attrs({
        height: height + "px",
        width: this.outside_width + "px",
      });

    svg.select(".container")
      .attr("transform", `translate(${padding},0), scale(${scale})`);

    svg.selectAll(`.${window.lang}-only`)
      .styles({
        opacity: "1",
      })

    svg.selectAll(".province")
      .each(function(d){
        var that = d3.select(this);
        var prov = that.attr("id").split("-")[1];
        d3.select(this).datum([prov,undefined]);
      })
      .styles({
        fill: "#1f77b4",
        "fill-opacity": function(d, i){
          var prov = d3.select(this).attr("id").replace("CA-", "");
          var val = last_year_data[prov];
          return color_scale(val || 0);
        },
        "stroke-width": "2px",
        stroke: "#1f77b4",
        "stroke-opacity": function(d, i){
          var prov = d3.select(this).attr("id").replace("CA-", "");
          var val = last_year_data[prov];
          return color_scale(val || 0);
        },
      })
      .on("mouseenter", dispatch_mouseEnter)
      .on("mouseleave", dispatch_mouseLeave);


    const hide_map_components = (selector) => svg
      .selectAll(selector)
      .styles({
        visibility: "hidden",
      });
    const hide_optional_components = (provs, selector_template) => _.each(
      provs,
      (prov) => !_.some( data, (d) => d[prov] ) && hide_map_components( selector_template(prov) )
    );
    
    const optional_provinces = [
      "abroad", 
      "na",
    ];
    hide_optional_components(
      optional_provinces,
      (prov) => `.province#CA-${prov}`
    );

    const provinces_with_optional_markers = [
      "pe",
      "ns",
      "nb",
      "ncr",
    ];
    hide_optional_components(
      provinces_with_optional_markers,
      (prov) => `path#CA-${prov}-Marker`
    );


    html.selectAll("div.label")
      .data( _.chain(last_year_data)
        .toPairs()
        .sortBy( (d) => ordering[ d[0] ] )
        .value()
      )
      .enter()
      .append("div")
      .order()
      .attr("class", "label")
      .attr("tabindex", 0)
      .on("mouseenter", dispatch_mouseEnter)
      .on("focus", dispatch_mouseEnter)
      .on("mouseleave", dispatch_mouseLeave)
      .on("blur", dispatch_mouseLeave)
      .each( function(d, i){
        var prov = d[0];

        var label = svg.selectAll("g.label")
          .filter(function(){ 
            return d3.select(this).attr("id") === `label-${prov}`;
          });

        var coords = label.attr("transform")
          .replace(/(translate\(|\)|)/g,"")
          .replace(","," ")
          .split(" ");

        d3.select(this)
          .styles({
            "border-radius": "5px",
            position: "absolute",
            left: padding+scale*coords[0]+"px",
            top: scale*coords[1]+"px",
            "text-align": "center",
            "font-size": "10px",
            "min-width": scale*110+"px",
            "min-height": "35px",
            height: scale*80+"px",
            "background-color": "#CCC",
          }); 

        
        const prov_text_key = (prov === 'ON' || prov === 'QC') ? 
          `${prov}lessncr` : 
          prov;
        
        let provName;
        if ( provinces[prov_text_key] && (scale > 0.5) ){
          //If the graph is large enough and the full name is defined, use full name
          provName = provinces[prov_text_key].text; 
        } else if ( provinces_short[prov_text_key] && (scale < 0.5) ){ 
          //If the graph is too small and the short name is defined, use short name. Basically bilingual prov codes
          provName = provinces_short[prov_text_key].text; 
        } else {
          provName = prov;
        }

        
        d3.select(this)
          .append("div")
          .html(provName);

        d3.select(this)
          .append("a")
          .attr('tabindex', -1)
          .styles({
            color: "black",
            "text-decoration": "none",
          })
          .html( formater(d[1]) )
      });
  };
}
