// base map obtained from [here](http://commons.wikimedia.org/wiki/File:Canada_blank_map.svg) 
//
// data in the following format:
//  ```javascript
//  [ {"on" : 1000, "qc": 2000, etc..}]
//  [ {"on" : 1000, "qc": 2000, etc..}]
//  [ {"on" : 1000, "qc": 2000, etc..}]
//  [ {"on" : 1000, "qc": 2000, etc..}]
//  ```
//  with the array ordered by fiscal year
//

import graphRegistry from "../graphRegistry.js";
import { businessConstants } from '../../models/businessConstants.js';
import { canada_svg } from "./canada.yaml";

const { provinces, provinces_short } = businessConstants;
const canada_svg_text = canada_svg.text;

const ordering = {
  abroad: 1,
  na: 2,
  yt: 3,
  nt: 4,
  nu: 5,
  bc: 6,
  ab: 7,
  sk: 8,
  mb: 9,
  on: 10,
  qc: 11,
  nl: 12,
  ncr: 13,
  nb: 14,
  ns: 15,
  pe: 16,
};

export class Canada_D3_Component {
  
  constructor(container, options){

    options.alternative_svg = canada_svg_text;
  
    graphRegistry.setup_graph_instance(this, d3.select(container), options);
  };

  render(options){
    this.options = _.extend(this.options, options);

    const x_scale_factor = 1396;
    const y_scale_factor = 1346;
    
    const max_height = 700;
    const x_scale = this.outside_width / x_scale_factor;
    const y_scale = max_height / y_scale_factor;
    const scale = Math.min(x_scale, y_scale);
    const height = scale * y_scale_factor;
    const padding = ( this.outside_width - (scale * x_scale_factor) ) / 2;
    const main_color = this.options.color;
    const color_scale = this.options.color_scale;
    const formatter = this.options.formatter;
    const includeNcr = this.options.includeNcr;
    
    const data = this.options.data;
    const last_year_data = _.last(data);

    const html = this.html;
    const svg = this.svg;
    const graph_dispatcher = this.dispatch;
    

    // Set dimensions and scaling of svg
    svg
      .attrs({
        height: height + "px",
        width: this.outside_width + "px",
      });
    svg.select(".container")
      .attr("transform", `translate(${padding},0), scale(${scale})`);

    // Unhide map components specific to current language
    svg.selectAll(`.${window.lang}-only`)
      .styles({
        opacity: "1",
      });


    // Graph event dispatchers
    let previous_event_target_prov_key = false;
    const dispatch_mouseLeave = function(){
      if (previous_event_target_prov_key) {
        svg.select(`#CA-${previous_event_target_prov_key}`)
          .styles({
            "stroke-width": "2px",
            stroke: main_color,
          });
      }
      previous_event_target_prov_key = false;
      graph_dispatcher.call("dataMouseLeave");
    };
    const dispatch_mouseEnter = function(prov_key){
      if (previous_event_target_prov_key) {
        svg.select(`#CA-${previous_event_target_prov_key}`)
          .styles({
            "stroke-width": "2px",
            stroke: main_color,
          });
      }
      if ( !_.isUndefined(last_year_data[prov_key]) ){
        previous_event_target_prov_key = prov_key;
        svg.select(`#CA-${prov_key}`)
          .styles({
            "stroke-width": (prov_key === "abroad" || prov_key === "na") ? "8px" : "15px",
            stroke: main_color,
          });
  
        graph_dispatcher.call("dataMouseEnter", "", prov_key);
      }
    };

    // Set province colours, attach event dispatchers
    svg.selectAll(".province")
      .each(function(d){
        var that = d3.select(this);
        var prov_key = that.attr("id").split("-")[1];
        d3.select(this).datum(prov_key);
      })
      .styles({
        fill: main_color,
        "fill-opacity": function(prov_key, i){
          var val = last_year_data[prov_key];
          return color_scale(val || 0);
        },
        "stroke-width": "2px",
        stroke: main_color,
        "stroke-opacity": function(prov_key, i){
          var val = last_year_data[prov_key];
          return color_scale(val || 0);
        },
      })
      .on("mouseenter", dispatch_mouseEnter)
      .on("focus", dispatch_mouseEnter)
      .on("mouseleave", dispatch_mouseLeave)
      .on("blur", dispatch_mouseLeave);

    // Add labels to provinces with data, attach event dispatchers
    html.selectAll("div.label")
      .data( _.chain(last_year_data)
        .toPairs()
        .map( ([prov_key, prov_value]) => prov_key )
        .sortBy( (prov_key) => ordering[prov_key] )
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
      .each( function(prov_key, i){

        const label = svg.selectAll("g.label")
          .filter(function(){ 
            return d3.select(this).attr("id") === `label-${prov_key}`;
          });
        prov_key === "on" && !includeNcr ?
          label.attr("transform", `translate(${label.node().transform.baseVal[0].matrix.e * 1.1},${label.node().transform.baseVal[0].matrix.f})`)
          : null;

        const coords = label.attr("transform")
          .replace(/(translate\(|\)|)/g,"")
          .replace(","," ")
          .split(" ");

        d3.select(this)
          .styles({
            left: padding + (scale * coords[0]) + "px",
            top: scale * coords[1] + "px",
            padding: "5px",
            position: "absolute",
            "border-radius": "5px",
            "text-align": "center",
            "font-size": "10px",
            "background-color": window.infobase_color_constants.separatorColor,
          }); 

        
        const prov_text_key = (includeNcr && (prov_key === 'on' || prov_key === 'qc')) ? 
          `${prov_key}lessncr` : 
          prov_key;
        
        let prov_name;
        if ( provinces[prov_text_key] && (scale > 0.5) ){
          // If the graph is large enough and the full name is defined, use full name
          prov_name = provinces[prov_text_key].text; 
        } else if ( provinces_short[prov_text_key] && (scale < 0.5) ){ 
          // If the graph is too small and the short name is defined, use short name. Basically bilingual prov codes
          prov_name = provinces_short[prov_text_key].text; 
        } else {
          prov_name = prov_key;
        }
        
        d3.select(this)
          .append("p")
          .style("margin-bottom", "0px")
          .html(prov_name);

        d3.select(this)
          .append("p")
          .style("margin-bottom", "0px")
          .html( formatter(last_year_data[prov_key]) );
      });


    // Hide optional map components based on data availability
    const hide_map_components = (selector) => svg
      .selectAll(selector)
      .styles({
        visibility: "hidden",
      });
    const hide_optional_components = (prov_keys, selector_template) => _.each(
      prov_keys,
      (prov_key) => !_.some( data, (yearly_data) => yearly_data[prov_key] ) && hide_map_components( selector_template(prov_key) )
    );
    
    const optional_provinces = [
      "abroad", 
      "na",
    ];
    hide_optional_components(
      optional_provinces,
      (prov_key) => `.province#CA-${prov_key}`
    );
  
    const provinces_with_optional_markers = [
      "pe",
      "ns",
      "nb",
      "ncr",
    ];
    hide_optional_components(
      provinces_with_optional_markers,
      (prov_key) => `path#CA-${prov_key}-Marker`
    );
    !includeNcr ? hide_map_components("path#CA-ncr") && hide_map_components("path#CA-ncr-Marker") : null;
  };
}
