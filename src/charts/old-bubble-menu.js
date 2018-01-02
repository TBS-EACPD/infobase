"use strict";
exports = module.exports;

var D3CORE = require('./core');
  
var rorate_point = function(r,i){
  var angle_increment = 35*Math.PI/180;
  var start_angle = -75*Math.PI/180;
  var actual_angle = start_angle + i*angle_increment;
  return [r*Math.cos(actual_angle),r*Math.sin(actual_angle)];
};

exports.bubble_menu = function(container,options){
// data in the format of
// ```javascript
// data = { "series 1" : [y1,y2,y3],
//         "series 2" : [y1,y2,y3]}
// ticks = ["tick1","tick2"."tick3"]
// ```
  D3CORE.setup_graph_instance(this,container,options);
  this.html.select(".__svg__").attr("preserve_labels_on_update", true);
  var _graph_area  = this.svg.append("g").attr("class","_graph_area");
  this.graph_area = _graph_area.append("g").attr("class","inner_graph_area");
  var that = this;
  var start_delay = this.start_delay || 0;
  var margin = this.margin = {top: 10,
    right: 20,
    bottom: 20,
    left: 10};
  this.data = this.options.data;
  this.colors = this.options.colors || D3CORE.tbs_color();
  
  _.each(this.data, function(d,i){
    d.__index = i;
    d.__rid__ = D3CORE.make_unique();
  });
  
  this.render(this.options);
  
  this.graph_area
    .attr("transform", "translate(0," + margin.top + ")");

  this.graph_area.append("circle").classed("background",true);

  var major_circles = this.graph_area.selectAll("cirlce.major")
    .data(this.data);

  var major_labels = this.html.selectAll("div.event-target")
    .data(this.data);

  major_circles.exit().remove();
  major_labels.exit().remove();

  major_circles
    .enter()
    .append("circle")
    .on("mouseenter", this.dispatch.dataMouseEnter)
    .attr({
      "class" : "major",
      cx : 0,
      cy : 0,
      r : 0,
    })
    .style({
      fill : (function(d,i) { return this.colors(i);}).bind(this),
    });

  major_labels
    .enter()
    .append("div")
    .attr({ "class" : "event-target transparent_div"  })
  //.on("mouseenter", dispatch.dataMouseEnter)
    .on("click",this.dispatch.dataMouseEnter)
    .append("a")
    .attr({ "class" : "bubble-label","href": "#" })
    .on("focus", this.dispatch.dataMouseEnter);

  this.dispatch.on("dataMouseEnter",this.render_bubble.bind(this));

  this.dispatch.dataMouseEnter();

};

exports.bubble_menu.render = function(){
  this.dispatch.dataMouseEnter();
};

exports.bubble_menu.prototype.render = function(options) {
  var that = this;

  var width = this.outside_width - this.margin.left - this.margin.right;
  var height = this.height = this.outside_height - this.margin.top - this.margin.bottom;
  
  var circle_padding = this.circle_padding= 30;
  var radius = this.radius = 0.25*this.height;
  var needed_width  = this.needed_width = this.data.length * (radius *2 + 2*circle_padding) ;
  var x_offset = this.x_offset = this.margin.left + (width - needed_width)/2;
  this.scale = d3.scale.ordinal()
    .domain(d3.range(this.data.length))
    .rangeRoundBands([0,needed_width]);
  // get width of last (or first if this.data.length === 1) container
  this.container_width = needed_width - this.scale(this.data.length-1);
  this.focus_scale_factor = 1.25;
  this.satellite_radius = (height - this.focus_scale_factor*2*radius)*0.5*0.25;
  this.satellite_padding = (height - this.focus_scale_factor*2*radius)*0.05;
  this.no_focus_scale_factor = (1/radius) * (needed_width - this.focus_scale_factor*2*(radius+circle_padding) -  ((this.data.length-1)*2*circle_padding))/((this.data.length-1)*2);
  
  if (needed_width > width + 2*circle_padding){
    d3.select(that.html.node().parentNode).style({
      //width : width+"px",
      "overflow-x" : "auto",
    });
    x_offset = this.x_offset = 0;
    width = needed_width;
  }
  
  this.svg
    .attr("width", width+this.margin.left+this.margin.right)
    .attr("height", height+this.margin.bottom+this.margin.top)
  
  var data_area;
  var duration;
  
  _.each(this.data, function(datum) {
    if (datum.active) {
      data_area = datum;
      datum.active = false;
      duration = 1;
    }
  });
  
  this.dispatch.dataMouseEnter(data_area, undefined, duration, true);
}

exports.bubble_menu.prototype.set_positions = function(d, active_d){
  var mag_offset;
  var radius = this.radius;
  d.__r = this.radius;
  d.__margin = this.circle_padding;
  d.__x =  this.x_offset + this.scale(d.__index);
  d.__xAdjust = 0; //__xAdjust and __xAdjustMajor are used to re-adjust the bubble menu when there are only two data types/major bubbles being presented
  d.__xAdjustMajor = 0;
  d.__width = this.container_width;
  if (active_d){
    if (d === active_d){
      d.__r *= this.focus_scale_factor;
      d.__margin *= this.focus_scale_factor;
      d.__x =  this.x_offset + d.__index * 2*radius*this.no_focus_scale_factor;
      d.__width = this.needed_width - (this.data.length-1)*this.no_focus_scale_factor*2*radius;

      _.each(d.children, function(child,i){
        var x_y =  rorate_point( d.__r+this.satellite_radius+this.satellite_padding, i);
        x_y[0] += d.__x+  d.__r+ d.__margin;
        x_y[1] += this.height/2;
        child.__x = x_y[0];
        child.__y = x_y[1];
        child.__width = 1.5*d.__r;

        if (child.__x < d.__x+  d.__r+ d.__margin) {
          child.__x -= child.__width;
          child.__x += 2*this.satellite_radius;
        } 
      },this);
      if(this.data.length === 2){
        active_d.__xAdjust = d.__xAdjust = d.__xAdjustMajor = -1 * d.__r * this.no_focus_scale_factor * 0.50;
      }
    } else {
      d.__width -= 2*this.circle_padding;
      d.__width *= this.no_focus_scale_factor;
      d.__r *=  this.no_focus_scale_factor;
      d.__margin = 0;
      if (d.__index < active_d.__index){
        d.__x =  this.x_offset + d.__index * d.__width;
        d.__xAdjustMajor = (this.data.length === 2) ? -1 * d.__r * this.no_focus_scale_factor * 0.85 : 0;
      } else {
        var index_diff = this.data.length - d.__index;
        d.__x = this.x_offset + this.needed_width - index_diff*d.__width;
        d.__xAdjustMajor = (this.data.length === 2) ? d.__r * this.no_focus_scale_factor * 0.85 : 0;
      }

    }
  }
};

exports.bubble_menu.prototype.render_bubble = function(active_d,i,duration,prevent_render_end){
  if (active_d && active_d.active===true){return;}
  duration = duration || 500;
  var that = this;
  var height = this.height;
  var radius = this.radius;
  var satellite_radius = this.satellite_radius;
  var svg_transition = this.graph_area.transition().duration(duration);
  var html_transition = this.html.transition().duration(duration);

  _.each(this.data, function(d){
    d.active = false;
    this.set_positions(d,active_d);
  },this);

  if (active_d){
    active_d.active = true;
    if (!prevent_render_end) {
      setTimeout(function(){
        that.dispatch.renderEnd(active_d);
      },duration);
    }
  }

  svg_transition.selectAll("circle.major")
    .attr({
      "cx": function(d){ 
        return d.__x+  d.__r+ d.__margin + d.__xAdjustMajor; 
      },
      "cy" : height/2,
    })
    .style({
      "fill-opacity" : function(d){
        if (active_d && d !== active_d){
          return 0.2;
        }
        return 0.5;
      },
    })
    .attr({
      "r" : function(d){ return d.__r;},
    });
   
  this.graph_area.selectAll("rect.sattelite").remove();
  this.html.selectAll("div.sattelite").remove();
  this.graph_area.select("circle.background").style({ "fill-opacity" : 0 });

  this.html.selectAll("div.event-target")
    .style({
      //"border": "1px solid black",
      "position" : "absolute",
      "height" : height + "px",
      "top" : this.margin.top +"px",
      "width": function(d){ return d.__width+"px";},
      "left" : function(d){return d.__x + d.__xAdjustMajor + "px";},
    })
    .select("a.bubble-label")
    .classed("center-text", true)
    .html(function(d){
      if (d === active_d){
        return d.description;
      } else {
        return d.title;
      }
    })
    .style({
      "font-weight": function(d){
        if (d !== active_d){
          return "500";
        } else {
          return "300";
        }
      },
      "position" : "absolute",
      "color" : "black",
      "text-decoration": "none",
      "opacity" : 0,
      "width" : function(d){
        if (d === active_d){
          return 1.8*radius+"px";
        }
        return 1.5 * radius+"px";
      },
      "left": function(d,i){
        var w = d.__width/2;
        return w+"px";
      },
      "top" : function(d,i){
        var t =  height/2 ;
        return t+"px";
      },
      "font-size" : function(d){
        var size;
        if (d === active_d){
          size = 14;
        } else if (active_d){
          size = 12;
        } else {
          size = 16;
        }
        return size + "px";
      },
    });

  html_transition.selectAll("a.bubble-label")
    .style({
      "opacity" : 1,
      "left": function(d){
        if (d === active_d){
          return d.__margin + (2*d.__r - this.offsetWidth)/2+"px" ; 
        }
        return (d.__width - this.offsetWidth)/2+"px" ; 
      },
      // after the transition time, the text has been rendered
      // and we can use the rendered height and width to position
      // it in the center of the circle
      "top" : function(d,i){
        var t =  height/2 - this.offsetHeight/2 ;
        return t+"px";
      },
    });


  if (active_d) {

    this.graph_area.select("circle.background")
      .attr({
        "cx": active_d.__x + active_d.__width/2 ,
        "cy" : height/2,
        "r" : 2 *active_d.__r,
      })
      .style({
        "fill" : this.colors(active_d.__index),
        "fill-opacity" : 0.2,
      });

    this.graph_area.selectAll("rect.sattelite")
      .data(active_d.children)
      .enter()
      .append("rect")
      .attr({
        "class" : "sattelite",
        "x" : active_d.__x +active_d.__r + active_d.__xAdjust,
        "y" : height/2,
        "height" : 2* satellite_radius,
        "width": function(d) { return d.__width;},
        "rx" :  satellite_radius,
      })
      .style({
        "fill" : this.colors(active_d.__index),
        "fill-opacity" : 0.7,
      });

    svg_transition.selectAll("rect.sattelite")    
      .attr({
        "x" : function(d){ 
          return d.__x - satellite_radius + active_d.__xAdjust; 
        } ,
        "y" : function(d){ 
          return d.__y -  satellite_radius; 
        },
      });

    this.html.selectAll("div.event-target")
      .filter(function(d){ return d=== active_d;})
      .selectAll("div.sattelite")
      .data(active_d.children)
      .enter()
      .append("div")
      .attr({ "class" : "sattelite center-text" })
      .style({
        "opacity": 0,
        "font-size" : "13px",
        "font-weight" : "500",
        "position" : "absolute",
        "width": function(d){ return d.__width+"px";},
        "height" : 2* this.satellite_radius + "px",
        "border-radius" : this.satellite_radius+'px',
        "left" : "0px",
        "top" : "0px",
      })
      .append("a")
      .style({
        "position" : "absolute",
        "color" : "black",
        "width": function(d){ return d.__width+"px";},
        "left" : "0px",
        "top" : this.height/2 +"px",
      })
      .attr("href",function(d){return d.href;})
      .html(function(d){ return d.text; });

    html_transition.selectAll("div.sattelite")
      .style({
        "opacity": 1,
        "left" : (function(d){ 
          return d.__x- active_d.__x- this.satellite_radius +"px"; 
        }).bind(this),
        "top" : (function(d){ 
          return d.__y-  this.satellite_radius + "px"; 
        }).bind(this),
      });

    html_transition.selectAll("div.sattelite a")
      .style({
        "left" : function(d){
          return d.__width/2 - this.offsetWidth/2 + "px";
        },
        "top" : function(d){ 
          return satellite_radius - this.offsetHeight/2+"px"; 
        }, 
      });
  }
};
