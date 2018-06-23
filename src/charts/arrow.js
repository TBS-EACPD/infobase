import common_charts_utils from './common_charts_utils';


function add_arrow(sel){
  return sel
    .append("path")
    .styles({
      "stroke-width":1,
      "stroke-opacity":1,
      "fill-opacity":0.5,
    })   
    .attrs({
      "d" : "M 29.653912,-0.10968436 0.36255227,38.029976 l 12.51457473,0 0,61.44578 33.074233,0 0,-61.41987 12.929135,0 -29.226583,-38.16557036 z",
      "class" : "arrow",
    });
}


export class Arrow {
  
  constructor(container,options){

    common_charts_utils.setup_graph_instance(this,d3.select(container),options);
    this.graph_area  = this.svg.append("g").attr("class","graph_area");
  };

  render(options){
    this.options = _.extend(this.options,options);

    var margin = this.options.margin || {top: 30, 
      right: 10, 
      bottom: 30, 
      left: 10};
    var color = this.options.color || common_charts_utils.tbs_color();
    var formater = this.options.formater;
    var arrow_width = 60;
    var arrow_height = 100;
    var padding = 30;
    this.width = this.outside_width - margin.left - margin.right;
    var height = this.outside_height - margin.top - margin.bottom;
    var data = this.options.data;

    // based on the height of the pane
    var scale = d3.scaleLinear()
      .domain([0,d3.max(data, function(d){return Math.abs(d.value);})])
      .range([1,height/arrow_height])
      .clamp(true);

    // get offset to shift the arrows into the middle of the 
    // pane
    var required_width = d3.sum(data, function(d){
      return scale(Math.abs(d.value))*arrow_width+padding;
    });

    var x_offset = (this.outside_width - required_width)/2;

    this.svg
      .attr("width", this.outside_width+margin.left+margin.right)
      .attr("height", this.outside_height+margin.top+margin.bottom)
    this.graph_area.attr("transform", "translate(" + x_offset + "," +margin.top + ")");

    var html = this.html;

    // join the filtered data to the circles
    var arrow = this.graph_area
      .selectAll("g.arrow")
      .data(data,function(d){ return d.name;});


    _.each(data, (d,i,col)=>{
      d.scale = scale(Math.abs(d.value));
      d.width = d.scale * arrow_width;
      d.height = d.scale * arrow_height;
      d.y = height -  d.height ;
      if (i>0){
        d.x = col[i-1].x + col[i-1].width + padding;
      } else {
        d.x = 0;
      }
    });

    arrow.exit().remove();

    const new_arrow = arrow
      .enter()
      .append("g")
      .attr("class","arrow")

    new_arrow.merge(arrow)
      .attr("transform",function(d,i){
        return "translate(" + d.x+ "," +d.y + ")";
      })
      .filter(function(d){
        return d.scale >= 1.01;
      })
      .each(function(d,i){
        add_arrow(d3.select(this));
      });

    new_arrow
      .selectAll("path.arrow")
      .filter(function(d){
        //don't draw arrows if the scale of change is less than 0.1%
        return d.scale >= 1.01;
      })
      .attr("transform",function(d,i){
        var transform = '';
        if (d.value <0){
          transform += "rotate(180,"+(d.width+padding/2)/2+","+d.height/2+")";
        } else {
          transform += "translate("+padding/2+",0)";
        }
        transform += "scale("+ d.scale+ ") ";
        return transform;
      })
      .styles({
        "fill" : function(d,x,i){ return color(i);},
        "stroke": function(d,x,i){ return color(i);},
      });

    new_arrow
      .filter(function(d){
        //don't draw arrows if the scale of change is less than 0.1%
        return d.scale < 1.01;
      })
      .append("line")
      .attrs({
        "class" : "flat",
        "x1" : 0,
        "x2" : function(d){ return padding+d.width;},
        "y1" : function(d){ return d.height/2 - 20;},
        "y2" : function(d){ return d.height/2 - 20;},
        "stroke" : function(d,x,i){ return color(i);},
        "stroke-width" : "10px",
      }) ;

    new_arrow
      .append("text")
      .attrs({
        "x" : function(d){
          return (d.width + padding)/2;
        } ,
        "y" :  function(d){
          return d.height/2;
        },
      })
      .styles({
        "text-anchor" : "middle",
        "font-weight" : "500",
      })
      .text(function(d){
        return formater(d.value);
      });

    var bottomtext = html
      .selectAll("div.bottomtext")
      .data(data,function(d){ return d.name;});

    bottomtext.exit().remove();

    const new_bottomtext = bottomtext
      .enter()
      .append("div");

    new_bottomtext.merge(bottomtext)
      .html(function(d){ return d.name;})
      .attr("class", "font-serif bottomtext center-text")
      .styles({
        "top"  : height+margin.bottom+"px",
        "position" : "absolute",
        "color" : "#222",
        "font-size" : "16px",
        "font-weight" : "500",
        "width" : function(d){ return d.width+padding+"px";},
        "left"  : function(d){ return x_offset+d.x+"px";},
      });
  };
};
