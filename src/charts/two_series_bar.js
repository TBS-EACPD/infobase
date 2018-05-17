exports = module.exports;
const common_charts_utils = require('./common_charts_utils');

exports.TWO_SERIES_BAR = class TWO_SERIES_BAR  {
  
  
  constructor(container,options){
  // data in the format of
  // ```javascript
  // "series 1" : [y1,y2,y3],
  // "series 2" : [y1,y2,y3],
  // ticks = ["tick1","tick2"."tick3"]
  // ```

    common_charts_utils.setup_graph_instance(this,d3.select(container),options);
    ;
    const _graph_area  = this.svg.append("g").attr("class","_graph_area");
    this.grid_line_area = _graph_area.append("g").attr("class","grid_lines");
    this.graph_area = _graph_area.append("g").attr("class","inner_graph_area");
  }

  render(options){
    this.options = _.extend(this.options,options);
    this.margin = this.options.margin || {top: 25,
      right: 20,
      bottom: 30,
      left: 80};
    const height = this.outside_height - this.margin.top - this.margin.bottom;
    const width = this.outside_width - this.margin.left - this.margin.right;
    const x_axis_rotate = this.options.x_axis_rotate || "0deg";
    const title = this.options.title;

    this.svg
      .attrs({
        width : this.outside_width,
        height : this.outside_height,
      })
      .select("._graph_area")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    const series1 = _.clone(this.options.series1);
    series1.extent = d3.extent(series1.data);
    series1.extent[0] = series1.extent[0] < 0 ?  series1.extent[0] : 0;
    const series2 = _.clone(this.options.series2);
    series2.extent = d3.extent(series2.data);
    series2.extent[0] = series2.extent[0] < 0 ?  series2.extent[0] : 0;
    const larger = (series1.extent[1] - series1.extent[0]) >= (series2.extent[1] - series2.extent[0]) ? series1 : series2;
    const smaller = larger === series1 ? series2 : series1;
    const series_labels = [larger.label, smaller.label];
    const label_font_size = 12; // this is in pt, not px
    const colors = this.options.colors || common_charts_utils.tbs_color()
    const ticks = this.options.ticks;

    // `x0` scale sets out the chunks of space for each
    // of the series
    // `x1` uses the chunks of space from x0 to then create
    // sub-spaces for each of the labels
    const x0 = d3.scaleBand()
      .domain(ticks)
      .rangeRound([0, width])
      .padding(0.1);

    const x1 = d3.scaleBand()
      .domain(series_labels)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.2);

    const xAxis = d3.axisBottom()
      .scale(x0)
      .tickPadding(5);

    larger.has_pos = larger.extent[1] >= 0;
    larger.has_neg = larger.extent[0] < 0;
    smaller.has_pos = smaller.extent[1] >= 0;
    smaller.has_neg = smaller.extent[0] < 0;
    const larger_abs_span = larger.extent[1] - larger.extent[0];
    const smaller_abs_span = smaller.extent[1] - smaller.extent[0]; 
    const larger_pos_proportion = larger.extent[1]/larger_abs_span;
    const smaller_pos_proportion = smaller.extent[1]/smaller_abs_span; 
    const larger_neg_proportion = larger.extent[0]/larger_abs_span;
    const smaller_neg_proportion = smaller.extent[0]/smaller_abs_span; 
    if (smaller_pos_proportion > larger_pos_proportion) {
      larger.extent[1] = smaller_pos_proportion * larger_abs_span;
    }
    if (smaller_neg_proportion < larger_neg_proportion) {
      larger.extent[0] = smaller_neg_proportion * larger_abs_span;
    }
    if (!larger.has_pos && smaller.has_pas) {
      const smaller_positive_proportion = smaller.extent[1] / smaller_abs_span;
      larger.extent[1] = smaller_positive_proportion *  larger_pos_proportion;
    }
    
    larger.y = d3.scaleLinear()
      .domain(larger.extent)
      .range([height,0]);

    smaller.mapper_to_larger = d3.scaleLinear()
      .domain(smaller.extent)
      .range(larger.extent);

    smaller.y = larger.y;

    // based on https://stackoverflow.com/a/21015393
    // get actual width and height of label text, in px
    // height is round conversion from pt font size to px, accurate enough here
    const get_label_size_actual = (label) => {
      var canvas = get_label_size_actual.canvas || (get_label_size_actual.canvas = document.createElement("canvas"));
      var context = canvas.getContext("2d");
      context.font = "bold " + label_font_size + "pt Helvetica,Arial,sans-serif";
      var metrics = context.measureText(label);
      return {width: metrics.width, height: label_font_size*1.3333};
    };

    // add the title
    this.html.select("div.title").remove();
    
    this.html.append("div.title")
      .styles({
        "position" : "absolute",
        "top": "-10px",
        "width" : "100%",
        "text-align" : "center",
        "font-size" : "14px",
        "font-weight" : "500",
      })
      .html(title);

    // create the group for holding the bars, either
    // stacked or grouped together
    const groups = this
      .graph_area
      .selectAll("g.tick-group")
      .data(ticks);
    
    groups.exit().remove();

    const new_groups = groups
      .enter()
      .append("g")
      .merge(groups)
      .attr("class", "tick-group");

    new_groups
      .attr("transform", function(d) { return "translate(" + x0(d) + ",0)"; });

    const y_bottom = larger.extent[0] > 0 ? 0 : 1.1 * larger.extent[0];
    const y_top = larger.extent[1] < 0 ? 0 : 1.1 * larger.extent[1];

    larger.y
      .domain([y_bottom, y_top])
      .range([larger.extent[1] >= 0 ? height : height -label_font_size, 0]);

    const bar_width = Math.min(x1.bandwidth(), this.max_width || 100);

    const data = _.map(ticks,(tick,i)=>{
      return {tick,
        data : [
          {
            tick, 
            label : larger.label,name, 
            value : larger.data[i], 
            display_value :larger.formater(larger.data[i]),
            labelSize : get_label_size_actual(larger.formater(larger.data[i]).replace(/<[^>]*>/g, '')),
          },
          {
            tick, 
            label : smaller.label,name, 
            value : smaller.mapper_to_larger(smaller.data[i]), 
            display_value : smaller.formater(smaller.data[i]),
            labelSize : get_label_size_actual(smaller.formater(smaller.data[i]).replace(/<[^>]*>/g, '')),
          },
        ]};
    });

    const labels_should_be_rotated = _.chain(data)
      .flatMap( data_item => data_item.data)
      .some( data_item_data => data_item_data.labelSize.width >= bar_width*1.25)
      .value();

    // create the grouped bars
    const bars = new_groups
      .selectAll("rect")
      .data((d,i) => data[i].data, (d,i) =>  i + d.display_value);
    
    const new_bars = bars
      .enter()
      .append("rect")
      .attr( "width", 1)
      .attr("height",1)
      .attr("y", larger.y(0))
      .styles({ "fill-opacity" : 1})
      .on("click", d => this.dispatch.call("dataClick", this, d.tick))
      .on("mouseover", this.dispatch.call("dataHover"))
      .on("mouseout", this.dispatch.call("dataHoverOut"));

    bars.exit().remove();

    bars.merge(new_bars)
      .transition()
      .duration(750)
      .styles({
        "fill": function(d) { return colors(d.label); },
      })
      .attr("y", function(d) {
        if (d.value > 0){
          return larger.y(d.value);
        } else {
          return larger.y(0);
        }
      })
      .attr( "x", function(d) { return x1(d.label) + (x1.bandwidth()-bar_width)/2 + "px"; })
      .attr( "width", bar_width)
      .attr("height", function(d) {
        if (d.value >= 0){
          return larger.y(0) - larger.y(d.value);
        } else {
          return larger.y(d.value) - larger.y(0);
        }
      })
      .on("end", this.dispatch.call("renderEnd"));

    this.graph_area.selectAll(".x.axis").remove();
    this.graph_area.selectAll("div.__labels").remove();

    this.graph_area.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + larger.y(0)+ ")")
      .call(xAxis);

    // remove the default svg text elements
    this.graph_area.select(".x.axis").selectAll(".tick text").remove();

    this.html.selectAll("div.tick").remove();

    // replace the removed text elements with html divs
    // these allow for text wrapping
    this.html.selectAll("div.tick")
      .data(ticks)
      .enter()
      .append("div")
      .attr("class","tick center-text")
      .styles({
        "transform": "rotate("+x_axis_rotate+")",
        "overflow-x" : "hidden",
        "position" : "absolute",
        "opacity" : 1,
        "top" : height+this.margin.top+10+"px",
        "width": x0.bandwidth()+"px",
        "left"  : d => x0(d)+this.margin.left+"px",  
      })
      .append("a")
      .attr("tabindex",0)
      .on("click", d => {
        this.dispatch.call("dataClick","render",d), 
        this.dispatch.call("dataClick","fade_out",d)
      })
      .on("keydown", (d)=>{
        if (d3.event.keyCode === 13) {
          this.dispatch.call("dataClick", d);
        }
      })
      .html(_.identity);
    
    this.html.selectAll("div.__labels")
      .data(data)
      .enter()
      .append("div")
      .attr("class","__labels")
      .styles({
        "position" : "absolute",
        "top" : "0px",
        "height" : "10px",
        "width": x0.bandwidth()+"px",
        "left"  : d => x0(d.tick)+this.margin.left+"px", 
      })
      .selectAll("div.__label")
      .data(function(d){ return d.data;})
      .enter()
      .append("div")
      .attr("class","__label center-text")
      .html(function(d){ 
        if (d.value !== 0) {
          return d.display_value;
        }
      })
      .styles({
        "padding" : "0px",
        "position" : "absolute",
        "text-weight" : "bold",
        "color": function(d) {
          return d.value<0 ? "red" : "black" ;
        },
        "width" : bar_width+"px",
        "font-size" : label_font_size + "px",
        "height" : "10px",
        "top"  : (d,ix) => {
          if (d.value === 0){
            return  larger.y(d.value)+"px";
          }
          else if (d.value > 0){
            let top_position = this.margin.top - 16 + larger.y(d.value) - 5;
            if (labels_should_be_rotated) {
              // labels are rotated for small bars, in which case the vertical position is adjusted (relative to bar_width) to accomodate
              top_position -= 0.15*bar_width;
            }
            return top_position+"px";
          } else {
            return larger.y(d.value) +20+ "px";
          }
        },
        "left"  : (d,ix) => {
          let left_position = x1(d.label)+(x1.bandwidth()-bar_width)/2;
          if (labels_should_be_rotated) {
            // labels are rotated for small bars, in which case the position of the left bar's label is adjusted to accomodate
            left_position += (ix === 0 ? -0.5 : 0)*(bar_width+d.labelSize.height);
          }
          return left_position+"px";
        },
        "transform" : d => labels_should_be_rotated ? "rotate(-45deg) translate3d(0,0,0)" : "rotate(0deg)",
      });

    this.html.selectAll("div.labels")
      .data(data)
      .exit()
      .remove();
  }
  

};
