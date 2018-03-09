"use strict";
exports = module.exports;

var D3CORE = require('./core');


exports.hbar = class hbar {
  
  constructor(container,options){

  // data in the format of 
  // ```javascript
  // [ { "value" : 10, "name" : "XYZ" },
  //   { "value" : 12, "name" : "XYZ" },
  //   { "value" : 11, "name" : "XYZ" }
  // ]
  //```

    D3CORE.setup_graph_instance(this,d3.select(container),options);

    var _graph_area  = this.svg.append("g").attr("class","_graph_area");
    this.graph_area = _graph_area.append("g").attr("class","inner_graph_area");
    
    var margin = this.options.margin || {top: 50,
      right: 20, 
      bottom: 30, 
      left: 10};
    this.bar_height = 30;
    this.margins = margin;
    this.width = this.outside_width - margin.left - margin.right;
    this.padding = 0.1;

    this.text_align = this.options.text_align || "right";

    this.graph_area
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    this.graph_area.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0,0)");

    this.html.append("div")
      .attr("class","total")
      .styles({
        "top" : "0px",
        "left" : "0px",
        "margin-left" : margin.left + "px",
        "position" : "absolute",
        "font-weight" : "500"});

    this.pos_color = "#1f77b4" ;
    this.neg_color = '#A52A2A';


    this.x_scale = this.options.x_scale;

  };

  render(options){
    _.extend(this.options,options);

    var data = this.options.data;

    this.height = (this.bar_height*(1+this.padding))*data.length;
    this.width = this.outside_width - this.margins.left - this.margins.right;

    this.svg
      .attr("width", this.width+this.margins.left+this.margins.right)
      .attr("height", this.height+this.margins.top+this.margins.bottom);

    var y = d3.scaleBand()
      .domain(_.map(data, "name"))
      .rangeRound([0, this.height])
      .padding(this.padding);

    var margins = this.margins;
    var href = this.options.href;
    var extent = d3.extent(data, function(d){return d.value;});
    var x_left = extent[0] > 0 ? 0 : extent[0];
    var x_right = extent[1] < 0 ? 0 : extent[1];
    var formater = this.options.formater || _.identity;
    var tick_number = this.options.tick_number;
    var pos_color = this.options.pos_color || this.pos_color;
    var neg_color = this.options.neg_color || this.neg_color;

    //binding data to bars.
    var g = this.graph_area.selectAll("g.bar")
      .data(data,function(d){return d.name;});

    var text = this.html.selectAll("div.hbar_chart_labels")
      .data(data,function(d){return d.name;});

    var total = this.options.total;

    var x_scale = this.x_scale
      .range([0,this.width])
      .domain([x_left,x_right]);

    var text_align = this.text_align;

    if (total) {
      if (this.html.select("div.total").empty()) {
        this.html.append("div")
          .attr("class","total")
          .styles({
            "top" : "0px",
            "left" : "0px",
            "margin-left" : this.margins.left + "px",
            "position" : "absolute",
            "font-weight" : "500"});
      }
    
      this.html.select("div.total").html(total);
    }

    var xAxis = d3
      .axisTop(this.x_scale)
      .ticks(tick_number || 7)
          ;
          // .orient("top");

    if (this.ticks){
      xAxis.ticks(this.ticks);
    }
    if (this.options.axisFormater){
      xAxis.tickFormat(this.options.axisFormater);
    }

    this.graph_area
      .select(".x.axis")
      .call(xAxis);

    this.graph_area.select(".x.axis").selectAll(".tick text")
      .attr("transform", "rotate(-20)")
      .attr("text-anhor", "start");

    //removeing dead bars
    g.exit().remove();

    var new_g =  g
      .enter()
      .append("g")
      .merge(g)
      .attr("class" , "bar" )

    new_g
      .append("rect")
      .attrs({ "width": this.width +"px",
        "height" : y.bandwidth()+"px",
        "y": "0px",
      })
      .styles({
        "fill" : "#e6e6e6",
      })
      

    new_g
      .append("rect")
      .attrs({  "width": '0px',
        "height" : y.bandwidth()-8+"px",
        "y": "4px",
        'class' : "fill",
      })
      .styles({
        "fill" : function(d){return d.value > 0 ?  pos_color : neg_color;},
        "fill-opacity" : 0.5,
      })

    text.exit().remove();

    var new_text = text
      .enter()
      .append("div")
      .merge(text)
      .attr("class","hbar_chart_labels")
      .styles({
        "text-align" : text_align,
        "position" : "absolute",
        "width" : this.width+"px",
        "left" : margins.left+"px",
        "font-size" : "13px",
        "padding": "0 10px", 
      })
      .each(function(){
        var that = d3.select(this);
        if (href){
          that
            .append("a")
            .style("color","black");
        } else {
          that
            .append("span")
          // .merge(that)
            .style("color","black")
        }
      });


    new_text.order();

    new_text.each(function(d,i){

      var single = d3.select(this);
      single
        .transition()
        .duration(750)
        .styles({
          "top" : margins.top +4+ y(d.name) + "px",
        });
      if (href) {
        single.selectAll("a")
          .html(d.name + ": "+ formater(d.value))
          .attr("href",href);
      } else {
        single.selectAll("span")
          .html(d.name + ": "+ formater(d.value));
      }
    });

    new_g.each(function(d,i){
      var x_val = y(d.name);
      var single;
      single = d3.select(this);
      single
        .transition()
        .duration(750)
        .attr("transform", "translate(0,"+x_val+")" ); 

      single
        .selectAll("rect.fill")
        .transition()
        .delay(1000)
        .duration(500)
        .attrs({
          "x": x_scale(Math.min(0, d.value)),
          "width": Math.abs(x_scale(d.value) - x_scale(0)),
        })
        .styles({
          "fill" : d.value > 0 ?  pos_color : neg_color,
        });
      
      single
        .selectAll("rect")
        .filter(function(d, i) {return d3.select(this).attr("class") === null;})
        .attr("width", d3.max(x_scale.range()));
    });
  };
}
