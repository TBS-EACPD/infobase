"use strict";
exports = module.exports;

// this file depends on a template called "panel_t", it is 
// expect a function to be attached to D3 called "get_template"
// which will allow 
//

const {text_maker} = require('../models/text');


exports.panel = function(options){
  return new Panel(options);
};

class Panel { 
  constructor(options){

    this.colmd = options.colmd || 12;
    this.colsm = options.colsm || 12;


    var footnotes = options.footnotes || {};
    // create a temporary div element, set the inner HTML to
    // the rendered template and then attach the newly create
    // child node to options.target
    var new_temp_element = document.createElement("div");

    new_temp_element.innerHTML = text_maker("panel_t",{ 
      "summary" : text_maker('footnotes'),
      "details_content" : footnotes.details_content,
      "open_footnotes" : options.open_footnotes || false,
      "text_class" : options.text_class,
    });
    

    this.el = d4.select(new_temp_element.firstChild);
    options.target.node().appendChild(new_temp_element.firstChild);

    if (options.classes) {
      this.el.attr("class",options.classes);
    }

    if (options.title_el){
      this.el
        .select(".panel-title")
        .classed("panel-title",false)
        .append(options.title_el)
        .classed("panel-title",true);
    }
    if (options.off){
      if (!_.isArray(options.off)){
        options.off = [options.off];
      }
      _.each(options.off, option=>{
        if (option === "title"){
          this.el.select(".panel-heading").remove();
        } else {
          this.areas()[option].remove();
        }
      });
    }

    if (!options.panel_layout){
      options.panel_layout = {text: 6, graph: 6};
    }
    this.setup_layout(options.panel_layout);

    // psas DOM object instead of wrapped
    //exports.center_text(this.el,options.center_text_delay);

    if (options.no_style){
      this.el.select(".panel").classed("panel",false);
    }


  }

  remove(){
    this.el.remove();
  }

  add_text(text){
    if (_.isString(text)){
      this.areas().text.html(text);
    } else {
      this.areas().text.node().appendChild(text);
    }
    return this;
  } 

  setup_layout(layout){

    var text = this.areas().text;
    var graph = this.areas().graph;
    //create copies of the layout, since modifications might
    //be necessary, don't want to modify the original
    var text_layout = _.isArray(layout.text) ? _.map(layout.text, _.identity) : layout.text;
    var graph_layout = _.isArray(layout.graph) ? _.map(layout.graph, _.identity) : layout.graph; 
    var text_sum;
    var graph_sum;
    if (_.isArray(text_layout)){
      text_sum = d4.sum(text_layout);

      _.each(text_layout, function(span,i){
        text.append("div")
          .classed(`fcol-md-${span} x${i+1}`,true);
      });
    } else {
      text_sum = text_layout
      this.el.select(".text").classed("fcol-md-"+text_layout,true);
    }
    if (_.isArray(graph_layout)){
      graph_sum = d4.sum(graph_layout);
      if (text_sum + graph_sum <= 12){
        graph_layout = _.map(graph_layout, function(x){return 12/graph_layout.length;});
        this.el.select(".graphic")
          .classed(`fcol-md-${graph_sum}`,true);
      }

      const graph_row = graph
        .append('div')
        .classed("frow",true);

      _.each(graph_layout, function(span,i){
        graph_row.append("div")
          .classed(`fcol-md-${span} x${i+1}`,true)
          .style("padding","0px")
          .style('position','relative');

      });
    } else {
      this.el.select(".graphic").classed("fcol-md-"+graph_layout,true);
    }

  } 
  add_source(sources){
    // sources and a11y_sources = [
    //  { href: "", html : ""},
    //  { href: "", html : ""},
    // ]
    this.el.select(".source")
      .html(text_maker('panel_source_t',{
        links: sources,
        a11y_links: sources,
      }));
    return this;
  }
  areas(){
    return {
      text :  this.el.select(".text"),
      title_right :  this.el.select(".title-right"),
      title :  this.el.select(".panel-title"),
      source : this.el.select(".source"),
      footnotes : this.el.select('.footnotes'),
      graph : this.el.select(".graphic .inner"),
    };
  }
}
