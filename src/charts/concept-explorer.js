import common_charts_utils from './common_charts_utils';

var base_colour =  'rgba(49,91,126,0.5)' ;
var hover_colour = 'rgba(49,91,126,1)';
var arc_color = "rgba(48,149,180,0.1)";
var soft_selected_color = "rgba(48,149,180,0.3)";
var selected_colour = "rgb(48,149,180)";
var found_colour = '#fcf8e3';

export class ConceptExplorer {
  
  constructor(container,options){
   
    common_charts_utils.setup_graph_instance(this,d3.select(container),options);
    var _graph_area  = this._graph_area = this.svg.append("g").attr("class","_graph_area");
    this.arc_area = _graph_area.append("g").attr("class","arcs");
    this.links_area = _graph_area.append("g").attr("class","links");
    this.tags_area = _graph_area.append("g").attr("class","tags");
    this.labels_area = this.html
      .append("div")
      .classed("fcol-sm-12", "true")
      .classed("labels", "true");
    
    this.html.select(".__svg__").attr("preserve_labels_on_update", true);

  };

  scan_for_selected_tags(){

    _.each(this.tag_data.values(), function(tag){
      tag.found = false;
      _.each(tag.tagged, function(tagged){
        tagged.found = false;
      })
      if (_.every(tag.tagged, "selected")){
        tag.soft_selected = true;
      } else {
        tag.soft_selected = false;
      }
      if (!_.every(tag.tagged, "selected")){
        tag.selected = false;
      }
    });
  };


  select_tagged(tagged){

    if(this.options.table_picker){
      _.each( this.tagged_data.values(), t => { 
        t.selected = false
      }) 

      tagged.selected = true;
      this.dispatch.call("taggedClick","xxx",tagged);
      this.render();
      return;
    }

    tagged.selected = !tagged.selected
    this.scan_for_selected_tags();
    this.render();
    this.dispatch.call("taggedClick","xxx",tagged);
    this.toggle_tag_arc();
    
  };

  select_tag(tag){
    if(this.options.table_picker){ return; }
    tag.selected = !tag.selected
    _.each(tag.tagged, function(tagged){
      tagged.selected = tag.selected;
    });

    this.scan_for_selected_tags();
    this.render();
    this.dispatch.call("tagClick","yyy",tag);
    this.toggle_tag_arc();
  };


  render(options) {

    this.options = _.extend(this.options,options); //Options isn't used for anything right now

    this.tag_data = this.options.tag_data;
    this.tagged_data = this.options.tagged_data;

    this.width = this.html.node().offsetWidth;
    this.top_label = this.options.top_label;
    this.legend_text = this.options.legend_text;
    this.bar_height = 22;
    this.bar_dy = 27;
    var data_driven_height = this.tagged_data.size() * this.bar_dy * 1.2; //1.2 is for extra padding on top and bottom
    var min_height = 500;
    if (data_driven_height > min_height ){
      this.height = data_driven_height;
      this.offset_y = this.height * 0.2/2;
    } else {
      this.height = min_height;
      this.offset_y = (min_height - data_driven_height/1.2) / 2;
    }

    //small window wasn't making it any prettier so it's being commented out...
    this.small_window = false; //window.matchMedia("(max-width: 1140px)").matches || this.options.small_window === true;
    this.html.style("height", this.height + "px");
    this.html.select(".__svg__").style("height", this.height + "px");
    
    this.svg.attrs({
      "width": this.width,
      "height": this.height,
    });
    
    this.svg.select("._graph_area").attr("transform", "translate(" + this.width/2 + "," + this.height / 2 + ")");            
        
    this.labels_area
      .styles({
        position: "relative",
        left: "0px",
        bottom: this.height + "px",
      });

    var tagged_data = _.sortBy(this.tagged_data.values(),function(d){
      return d.name;
    });

    var tag_data = _.sortBy(this.tag_data.values(),function(d){
      return d.tag;
    });

    if (this.small_window){
      this.angle_offset = 40
    } else {
      this.angle_offset = 60
    
    }

    this.render_top_labels();

    if(this.options.legend !== false){
      this.render_legend();
    }

    this.render_central_list(tagged_data);
    this.render_tags(tag_data);
    this.render_paths(tag_data);
    return this;

  };

  render_top_labels() {    

    var that = this;

    var label_text = [
      {text : this.top_label.tag},
      {text : this.top_label.tagged},
    ];

    if (!this.small_window){
      label_text.push({text : this.top_label.tag});
    }

    const div_label = this.html.selectAll("div.label")
      .data(label_text)
    

    const new_div_label = div_label
      .enter()
      .append("div")
      .attr("aria-hidden", true) //these labels don't help at all from an a11y standpoint
      .classed("label",true)

    div_label.merge(new_div_label)
      .html(_.property("text"))
      .styles({
        "position": "absolute",
        "width": "33%",
        "top": "0px",
        "left" : function(d,i){ return i * that.width/3 +"px"},
        "font-weight" : "500",
        "font-size"  : "15px" ,
        "text-align" : "center" ,
        "padding" : "3px",
      });
  };

  render_legend() {    
    var legend_text = [
      { text : this.legend_text.selected,
        "background-color"  : selected_colour,
        "color" : "white",
      },
      { text: this.legend_text.soft_selected,
        "background-color"   : soft_selected_color,
        "color" : "black",
      },
    ];


    const div_legend = this.html.selectAll("div.legend")
      .data(legend_text)
    
    const new_div_legend = div_legend
      .enter()
      .append("div")
      .attr('aria-hidden',true)
      .classed("legend",true)
    
    div_legend.merge(new_div_legend)
      .html(function(d){ return d.text;})
      .styles({
        "float": "right",
        "background-color"  : _.property("background-color"),
        "color"  : _.property("color"),
        "border" : "1px solid grey",
        "bottom" : "0px",
        "margin" : "5px" ,
        "text-align" : "center" ,
        "padding" : "3px",
      });
  };

  render_central_list(tagged_data) {    
    var that = this;

    var bar_width = 360;
    var text_x;

    // Set/Update visual data for all tagged
    _.each(tagged_data, function(tagged, i) {
      tagged.x = bar_width / -2;
      tagged.y = i * this.bar_dy + this.offset_y;
    },this);
    
    if (this.small_window) {
      text_x = {"pre_trans" : function(d) {return  that.width - bar_width -20+ "px";},
        "post_trans" : function(d) {return   that.width - bar_width -20 +  "px";},
      };
    } else {
      text_x = {"pre_trans" : function(d) {return that.width / 2 + (bar_width / -2 - 10) + "px";},
        "post_trans" : function(d) {return that.width / 2 + (d.x - 10) + "px";},
      };
    }
    
    const tagged_labels = this.labels_area.selectAll("button.tagged-label")
      .data(tagged_data, function(d) {return d.id;});

    tagged_labels.exit()
      // .transition().duration(500).ease("elastic")
      // .styles({
      //   "left": text_x.pre_trans,
      //   "top": function(d){ return d.y+"px"},
      //   "opacity": 0
      // })
      .remove();

    const new_tagged_labels = tagged_labels
      .enter()
      .append("button")
      .attr("class", function(d) {return "button-unstyled tagged-label";})
    
    
    tagged_labels.merge(new_tagged_labels)
      .attr("id", function(d) {return "tagged-label"+d.rid;})
      .attr("tabindex", 0)
      .attr("role","checkbox")
      .styles({
        "width": bar_width + "px",
        "position": "absolute",
        "left": text_x.pre_trans,
        "top": function(d){ return d.y+"px"},
        "padding-left" : "5px",
        "margin-left": (bar_width / 80 + 5) + "px",
        "margin-right": (bar_width / 80 + 5) + "px",
        "text-align" : "center",
        "cursor": "default",
      })
      .text(function(d) {return d.name;})
      .on("mouseenter", function(d) { that.highlight_links(d, true);})
      .on("focus", function(d) { that.highlight_links(d, true); })
      .on("mouseleave", function(d) {that.highlight_links(d, false);})
      .on("blur", function(d) {that.highlight_links(d, false);})
      .on("click", this.select_tagged.bind(this))
      .attr("aria-checked", d => !!d.selected)
      .styles({
        "opacity": 1, // Safety for when a user double clicks a filter
        "left": text_x.post_trans,
        "top": function(d){ return d.y+"px"},
        "cursor": "pointer",
        "border"  : function(d){
          return "2px solid " + d.selected ? selected_colour : base_colour ;
        },
        "color"  : function(d){
          return d.selected ? "#fff"  : hover_colour ;
        },
        "background-color"  : function(d){
          return d.selected ?  selected_colour : "white"; //"#d9edf7" 
        },
      });
          

  };

  toggle_tag_arc() {    
    var angle_offset = this.angle_offset - 20;
    var to_rads = function(deg) { return deg * Math.PI/180;}
    var num_sel =  _.filter(this.tagged_data.values().concat(this.tag_data.values()),{selected : true}).length;

    // draw the visual flourish of the coloured arcs around the tags
    if (this.arc_area.select("path.arc").node() === null && num_sel === 0){
      var arcs = [
        d3.arc()
          .innerRadius(327)
          .outerRadius(this.width/2)
          .startAngle(to_rads(angle_offset))
          .endAngle(to_rads(180 - angle_offset)),
      ];
      if (!this.small_window){
        arcs.push(
          d3.arc()
            .innerRadius(327)
            .outerRadius(this.width/2)
            .startAngle(-to_rads(angle_offset))
            .endAngle(-to_rads(180-angle_offset))
        );
      }

      const arc_tag = this.arc_area
        .selectAll(".arc")
        .data(arcs)
    
      const new_arc_tag = arc_tag
        .enter()
        .append("path")
        .classed("arc",true)

      arc_tag.merge(new_arc_tag)
        .attr("d", function(d){ return d();})
        .attr("stroke-width","2px" )
        .attr("stroke",soft_selected_color )
        .attr("fill", arc_color);


    } 
    if (num_sel > 0 ){
      this.svg.selectAll("path.arc").remove();
    }
  };

  render_tags(tag_data) {    
    /* NOTE:
          SVG rotates angles CW
          HTML/CSS rotates angles CCW
          Math library rotates angles CW
          Here, angles will be calculated in CCW
    */
    
    var that = this;

    var r = 4.5;
    var angle_spacing_l;
    var angle_spacing_r;
    
    this.toggle_tag_arc();

    if (this.small_window) {
      angle_spacing_l = (180 - 2 * this.angle_offset)/tag_data.length;
    }
    else {
      angle_spacing_l = (180 - 2 * this.angle_offset)/(Math.ceil(tag_data.length/2));
      angle_spacing_r = (180 - 2 * this.angle_offset)/(Math.floor(tag_data.length/2));
    }
    
    // Set/Update visual data for all nodes
    _.each(tag_data, function(tag_datum, i, data) {

      if (i <= Math.floor(data.length / 2) || that.small_window) { // Left
        tag_datum.side = "left";
        tag_datum.angle = 90 + this.angle_offset + i * angle_spacing_l; // CCW
      }
      else {
        tag_datum.side = "right";
        tag_datum.angle = 90 - this.angle_offset - (i - (Math.ceil(data.length / 2))) * angle_spacing_r; // CCW
      }
        
      tag_datum.dr = tag_datum.selected ? 300 : 330; // displacement radius        
    },this);
    
    
    // Re-used label functions
    var label = {
      left : function(d) {
        var left = that.width / 2; // use center as ref point
        left += (d.dr + 2 * r) * Math.cos(d.angle * Math.PI / -180);
        left -= d.side === "left" ? this.offsetWidth : 0;
        return left + "px";
      },
      top : function(d) {

        var top = that.html.node().offsetHeight / 2; // use center as ref point
        top += (d.dr + 2 * r) * Math.sin(d.angle * Math.PI / -180);
        top -= this.offsetHeight / 2;
        return top + "px";
      },
      transform : function(d) {
        var trans = "rotate(" + -d.angle + "deg)";
        trans += d.side === "left" ? " rotate(180deg)" : "";
        return trans;
      },
      transform_origin : function(d) {return d.side === "left" ? "100%" : "0%";},
      text_align : function(d) {return d.side === "left" ? "right" : "left";},
    };
    
    // Render tags
    const tag_circles = this.tags_area
      .selectAll(".tag-circle")
      .data(tag_data, function(d) {return d.tag;});
    
    tag_circles.exit().remove();

    const new_tag_circles = tag_circles
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .attr("class", "tag-circle")

    new_tag_circles
      .append("circle")
      .attr("r", r)

    tag_circles.merge(new_tag_circles)
      .attr("id", function(d) {return "tag-circle"+d.rid;})
      .on("mouseenter", function(d, i) {
        d3.select(this).select("circle").attr("stroke", "#315b7e");
        that.highlight_links(d, true);})
      .on("mouseleave", function(d, i) {
        d3.select(this).select("circle").attr("stroke", "#bce8f1");
        that.highlight_links(d, false);})
      .attr("transform",function(d) {
        return "rotate(" + -d.angle + ") translate(" + d.dr + ")";
      })

    new_tag_circles
      .select("circle")  
      .attr("fill", function(d) {
        if (d.selected){
          return selected_colour;
        } else if (d.found){
          return found_colour;
        } else {
          return "white";
        }
      })
      .attr("stroke", function(d) {
        if (d.selected){
          return selected_colour
        }
        else if (d.found){
          return "black";
        } else {
          return base_colour;
        } 
      })
      .attr("stroke-width", 1.5)
      .on("click", that.select_tag.bind(that ))

    const tag_labels = this.labels_area
      .selectAll(".tag-label")
      .data(tag_data, function(d) {return d.tag;});

    tag_labels.exit().remove();

    const new_tag_labels = tag_labels
      .enter()
      .append("button")
      .attr('role', 'checkbox')
      .attr("class", "button-unstyled tag-label")

    tag_labels.merge(new_tag_labels)
      .attr("id", function(d) {return "tag-label"+d.rid;})
      .attr("tabindex", 0)
      .text(function(d) {return d.tag;})
      .attr('aria-checked', d => !!d.selected )
      .on("mouseenter", function(d, i) {
        that.tags_area.select("g.node[rid='" + d.rid + "']").select("circle").attr("stroke", "#315b7e");
        that.highlight_links(d, true);
      })
      .on("focus", function(d, i) {
        that.tags_area.select("g.node[rid='" + d.rid + "']").select("circle").attr("stroke", "#315b7e");
        that.highlight_links(d, true);
      })
      .on("mouseleave", function(d, i) {
        that.tags_area.select("g.node[rid='" + d.rid + "']").select("circle").attr("stroke", "#bce8f1");
        that.highlight_links(d, false);
      })
      .on("blur", function(d, i) {
        that.tags_area.select("g.node[rid='" + d.rid + "']").select("circle").attr("stroke", "#bce8f1");
        that.highlight_links(d, false);})
      .on("click", this.select_tag.bind(this)) // Safety for when a user double clicks a filter
      .styles({
        "cursor": "pointer",
        "white-space": "nowrap",
        "line-height": "12px",
        "width": "auto",
        "font-size" : "12px" ,
        "opacity": 1,
        "text-align": label.text_align,
        "overflow-x" : "hidden",
        "padding": "4px 7.5px",
        "left": label.left,
        "top": label.top,
        "position": "absolute",
        /* IE 9 */
        "-ms-transform-origin": label.transform_origin,
        "-ms-transform": label.transform, 

        /* Chrome, Safari, Opera */
        "-webkit-transform-origin": label.transform_origin, 
        "-webkit-transform": label.transform,

        "transform-origin": label.transform_origin,
        "transform": label.transform,

        // "text-align": label.text_align,
        "background-color": function(d) {
          if (d.found) {
            return  found_colour;
          } else if (d.selected) {
            return  selected_colour;
          } else if (d.soft_selected) {
            return soft_selected_color;
          } else {
            return undefined;
          }
        },
        "border-radius": "25px",
        "border" : function(d){
          if (d.found){
            return "1px solid black";
          }
        },
        "color": function(d) {  
          return d.selected ? "#fff" : undefined;
        },
      })
                            
  };

  render_paths(tag_data) {
    var that = this;
    var links_data = []
    
    // Set/Update link data
    _.each(this.tag_data.values(), (tag_data, i) => {
      _.each(tag_data.tagged, tagged => {
        links_data.push({
          source: tag_data,
          selected : tag_data.selected,
          target: tagged,
          key: tag_data.tag + "-to-" + tagged.id,
        });
      }); 
    });
    
    
    const diagonal_generator = function link(d) {
      return "M" + (Math.cos((d.source.angle) * Math.PI / -180) * d.source.dr) + "," + (Math.sin((d.source.angle) * Math.PI / -180) * d.source.dr)
          + "C" + ((Math.cos((d.source.angle) * Math.PI / -180) * d.source.dr) + (d.source.side === "left" ? d.target.x : - d.target.x)) / 2 + "," + (Math.sin((d.source.angle) * Math.PI / -180) * d.source.dr)
          + " " + ((Math.cos((d.source.angle) * Math.PI / -180) * d.source.dr) + (d.source.side === "left" ? d.target.x : - d.target.x)) / 2 + "," + (d.target.y + that.bar_height/2 -  that.height/2 )
          + " " + (d.source.side === "left" ? d.target.x : - d.target.x) + "," + (d.target.y + that.bar_height/2 -  that.height/2) ;
    }

    const links = this.links_area
      .selectAll("path")
      .data(links_data, function(d) {return d.key;});
    
    links.exit().remove();  

    // const new_links//.transition().duration(1000).ease("elastic")
    //   .attr("d", diagonal_generator);
    
    const new_links = links.enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke-width", "1px")

    links.merge(new_links)
      .attr("d", diagonal_generator)
      .attr("stroke", function(d){
        return d.selected ?  selected_colour : base_colour ;
      });
   
  };

  highlight_links(d, highlight) {
    var hover_data = d;
    var that = this;
    
    /* Note 1: All data describing the live relationship between a node and a table
               is only stored in its link object.
       Note 2: All rect highlighting is handled by changing the "color" style. This color will 
               display if the "fill" attribute is set to "currentColor" (a CSS variable).
    */
    this.links_area.selectAll("path").filter(function(d, i) {
      if (hover_data.type === "tag") {
        return hover_data.rid === d.source.rid;
      } else if (hover_data.type === "tagged") {
        return hover_data.rid === d.target.rid;
      }
    })
      .attr("stroke", function(d){
        return highlight || d.selected ? hover_colour : base_colour ;
      })
      .attr("stroke-width", function() {return highlight ? "3px" : "1px";})
      .each(function(d) {
        that.tags_area.select("g#tag-circle" + d.source.rid + " circle")
          .attr("stroke", function() {
            return highlight  || d.selected ? hover_colour : base_colour;
          })
          .attr("fill", function(){;
            if (highlight){ return d.selected ;}
            if (d.selected){ return selected_colour;}
            return "#f9f9f9";
          });

        d3.select("button#tagged-label"+ d.target.rid)
          .filter(function(dd){
            return dd.selected !== true;
          })
          .styles({
            "background-color": function() {
              return highlight ? hover_colour : "#fff";
            },
            "color":function(){
              return highlight ? "#fff" : hover_colour;
            },
          });
      });
  };
};
