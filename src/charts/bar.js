import barStack from './bar_stack';
import common_charts_utils from './common_charts_utils';

export class Bar { 
  constructor(container, options){
    // data in the format of
    // ```javascript
    //  data = { 
    //   "series 1": [y1, y2, y3],
    //   "series 2": [y1, y2, y3]
    //  }
    //  ticks = ["tick1", "tick2", "tick3"]
    // ```
    common_charts_utils.setup_graph_instance(this, d3.select(container),options);
  
    var _graph_area = this.svg.append("g").attr("class", "_graph_area");
    this.grid_line_area = _graph_area.append("g").attr("class", "grid_lines");
    this.graph_area = _graph_area.append("g").attr("class", "inner_graph_area");
  }
  
  render(options){
    var that = this;
    this.options = _.extend(this.options, options);
  
    this.margin = this.options.margin || {top: 25,
      right: 20,
      bottom: 30,
      left: 80};
                                            
    const hide_gridlines = this.options.hide_gridlines === undefined ? false : this.options.hide_gridlines;
    const height = this.outside_height - this.margin.top - this.margin.bottom;
    const width = this.outside_width - this.margin.left - this.margin.right;
    const add_xaxis = !_.isUndefined(this.options.add_xaxis) ? this.options.add_xaxis : true;
    const add_yaxis = !_.isUndefined(this.options.add_yaxis) ? this.options.add_yaxis : true;
    const x_axis_line = this.options.x_axis_line === undefined ? true : this.options.x_axis_line;
      
    this.svg
      .attrs({
        width: this.outside_width,
        height: this.outside_height,
      })
      .select("._graph_area")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  
    this.normalized_formater = this.options.normalized_formater;
    this.number_formater = this.options.formater;
    var normalized= this.options.normalized || false;
  
  
    this.formater = normalized ? this.normalized_formater : this.number_formater;
    let data;
  
    const series = this.options.series;
    const series_labels = this.options.series_labels || d3.keys(series);
    const stacked = this.options.stacked;
    const label_font_size = 12;
    const add_labels = this.options.add_labels;
    const colors = this.options.colors || common_charts_utils.tbs_color()
    const title = this.options.title;
    const y_axis = this.options.y_axis || '';
    const ticks = this.options.ticks;
    const ticks_formatter = _.isFunction(this.options.ticks_formatter) ? this.options.ticks_formatter : _.identity;
    const values = d3.values(series);
    const extent = d3.extent(d3.merge(values));
    this.number_of_bars_to_render = d3.merge(values).length;
    const x_axis_rotate = this.options.x_axis_rotate || null;
    // calculate to protect against trying to stack negative numbers
    let y_bottom;
    let y_top;
    // `x0` scale sets out the chunks of space for each
    // of the series
    // `x1` uses the chunks of space from x0 to then create
    // sub-spaces for each of the labels
    // `y` maps the domain of the input data onto the available
    // height
    // `max`->merge will merge all the arrays into a single
    // and fine the max value
    const x0 = d3.scaleBand()
      .domain(ticks)
      .rangeRound([0, width])
      .padding(0.1);
  
    const x1 = d3.scaleBand()
      .domain(series_labels)
      .rangeRound([0,x0.bandwidth()])
      .padding(0.1);
      
  
    let bar_width;
    let bars;
  
    const y = d3.scaleLinear();
  
    const xAxis = d3.axisBottom()
      .scale(x0)
      .tickPadding(5);
  
    const yAxis = d3.axisLeft()
      .scale(y)
      .ticks(5)
      .tickFormat(this.formater);
  
    const html = this.html;
  
    if (series_labels.length === 0){
      return;
    }
  
    // add the title
    this.html
      .append("div")
      .styles({
        position: "absolute",
        "top": "-10px",
        "width": "100%",
        "text-align": "center",
        "font-size": "14px",
        "font-weight": "500",
      })
      .html(title);
  
    // remove all the older axes
    this.graph_area.selectAll("g.axis").remove();
  
    // create the group for holding the bars, either
    // stacked or grouped together
    var groups = this.graph_area.selectAll("g.tick-group")
      .data(ticks);
  
    groups.exit().remove();
  
    var new_groups = groups
      .enter()
      .append("g")
      .merge(groups)
      .attr("class", "tick-group");
  
    new_groups
      .attr("transform", (d) => "translate(" + x0(d) + ",0)");
  
    if ( stacked ){
  
      bar_width = x0.bandwidth();
  
      // remap the data to suitable format for the stacked
      // layout
      data = _.map(series_labels, (series_name) => {
        const values = series[series_name];
        return {
          name: series_name,
          data: _.map(values,(value,i) => {
            return {
              key: series_name,
              tick: ticks[i],
              y: value,
              x: x0(ticks[i]),
              name: series_name,
            };
          })};
      });
  
      if (normalized){
        _.each(ticks, (tick,i) => {
          var sum = d3.sum(
            _.map(data, (serie) => serie.data[i].y)
          );
          _.each(data, (serie) => serie.data[i].y /= sum);
        });
      }
  
      var stacks = barStack(data);
  
      y.domain(data.extent)
        .range([height,0]);
  
      // create the grouped bars
      bars = new_groups
        .selectAll("rect")
        .data(
          (d,i) => _.map(stacks, (stack) => stack.data[i]),
          (d,i) => d.key
        );
  
      const new_bars = bars
        .enter()
        .append("rect")
        .attr( "width", 1)
        .attr("height",1)
        .attr("y", y(0))
        .styles({
          "fill-opacity": 0.8,
        })
        .on("mouseover", this.dispatch.call("dataHover"))
        .on("mouseout", this.dispatch.call("dataHoverOut"));
  
      bars.merge(new_bars)
        .transition()
        .duration(750)
        .styles({
          "fill": (d) => colors(d.name),
        })
        .attr("y", (d) => y(d.y0) )
        .attr( "x", "0")
        .attr("width", bar_width)
        .attr("height", (d) => y(0) - y(d.size) )
        .on("end", _.bind(this.signal_render_end,this));
  
    } else {
  
      y_bottom = extent[0] > 0 ? 0 : 1.1 * extent[0];
      y_top = extent[1] < 0 ? 0 : 1.1 * extent[1];
  
      y.domain([y_bottom, y_top])
        .range([extent[1] >= 0 ? height : height -label_font_size, 0]);
  
      bar_width = Math.min(x1.bandwidth(), this.max_width || 100);
  
      data = _.map(ticks, (tick,i) => ({
        tick,
        data: _.map(series_labels, serie => ({
          tick, 
          name: serie, 
          value: series[serie][i],
        })),
      }));
  
      // create the grouped bars
      bars = new_groups
        .selectAll("rect")
        .data(
          (d,i) => data[i].data, 
          (d) => d.name + d.value
        );
  
      const new_bars = bars
        .enter()
        .append("rect")
        .attr( "width", 1)
        .attr("height",1)
        .attr("y", y(0))
        .styles({ "fill-opacity": 0.8 })
        .on("mouseover", this.dispatch.call("dataHover"))
        .on("mouseout", this.dispatch.call("dataHoverOut"));
  
  
      bars.merge(new_bars)
        .transition()
        .duration(750)
        .styles({
          "fill": (d) => colors(d.name),
        })
        .attr("y", (d) => {
          if (d.value > 0){
            return y(d.value);
          } else {
            return y(0);
          }
        })
        .attr( "x", (d) => x1(d.name) + (x1.bandwidth() - bar_width)/2 + "px")
        .attr( "width", bar_width)
        .attr("height", (d) => {
          if (d.value >= 0){
            return y(0) - y(d.value);
          } else {
            return y(d.value) - y(0);
          }
        })
        .on("end", _.bind(this.signal_render_end, this));
  
      // labels can only be added for non-stacked data
      if (add_labels){
  
        let div_labels = html.selectAll("div.labels")
          .data(data)
          
        div_labels
          .enter()
          .append("div")
          .attr("class","labels")
          .styles({
            "position": "absolute",
            "top": "0px",
            "height": "10px",
            "width": x0.bandwidth()+"px",
            "left": (d) => x0(d.tick) + that.margin.left + "px",
          })
          .attr( "x", (d) => x1(d.name) + (x1.bandwidth() - bar_width)/2 + "px")
          .attr( "width", bar_width)
          .attr("height", (d) => {
            if (d.value >= 0){
              return y(0) - y(d.value);
            } else {
              return y(d.value) - y(0);
            }
          });
  
        // labels can only be added for non-stacked data
        if (add_labels){
          html.selectAll("div.__labels").remove()
      
          html.selectAll("div.__labels")
            .data(data)
            .enter()
            .append("div")
            .attr("class","__labels")
            .styles({
              "position": "absolute",
              "top": "0px",
              "height": "10px",
              "width": x0.bandwidth()+"px",
              "left": (d) => x0(d.tick) + that.margin.left + "px",
            })
            .selectAll("div.__label")
            .data( (d) => d.data )
            .enter()
            .append("div")
            .attr("class","__label center-text")
            .html( (d) =>{ 
              if (d.value !== 0) {
                return that.formater(d.value);
              }
            } )
            .styles({
              "padding": "0px",
              "position": "absolute",
              "text-weight": "bold",
              "color": (d) => d.value<0 ? "red" : "black",
              "width": bar_width + "px",
              "font-size": label_font_size + "px",
              "height": "10px",
              "top": (d) => {
                if (d.value === 0){
                  return y(d.value)+"px";
                }
                else if (d.value > 0){
                  return that.margin.top - 12 + y(d.value) - 5+"px";
                } else {
                  return y(d.value) +20+ "px";
                }
              },
              "left": (d) => x1(d.name) + (x1.bandwidth() - bar_width)/2 + "px",
            });
          html.selectAll("div.labels")
            .data(data)
            .exit()
            .remove();
        }
      }
    }
  
    // remove all exiting bars
    bars.exit()
      .transition()
      .duration(750)
      .attr( "width", bar_width)
      .attr("height",1)
      .attr("y", y(0))
      .remove();
  
    if (add_xaxis){
      const xaxis_y_position = extent[0] < 0 && extent[1] > 0 ?
        y(0) :
        height;
  
      const x_axis_element = this.graph_area.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + xaxis_y_position + ")")
        .call(xAxis);
  
      // remove the default svg text elements
      this.graph_area.select(".x.axis").selectAll(".tick text").remove();
  
      html.selectAll("div.tick").remove();
  
      // replace the removed text elements with html divs
      // these allow for text wrapping
      var div_ticks = html.selectAll("div.tick")
        .data(ticks)
        
      div_ticks
        .enter()
        .append("div")
        .merge(div_ticks)
        .attr("class","tick center-text")
        .styles({
          "transform": x_axis_rotate ? undefined : "rotate("+x_axis_rotate+")",
          "overflow-x": "hidden",
          "position": "absolute",
          "top": height + this.margin.top + 10 + "px",
          "width": x0.bandwidth() + "px",
          "left": (d) => x0(d) + that.margin.left + "px",
        })
        .html(ticks_formatter);
  
      !x_axis_line && x_axis_element.remove();
      
      xaxis_y_position !== height && x_axis_element.selectAll(".tick").remove();
    }
  
    add_yaxis && this.graph_area.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class","axis-label")
      .attr("fill", "#000")
      .attr("x", 0)
      .attr("y", -5)
      .text(y_axis);
        
    !hide_gridlines && common_charts_utils.add_grid_lines("horizontal", this.grid_line_area, yAxis, width);
      
    return this;
  }
  
  signal_render_end(){
    if (this.number_of_bars_to_render-- === 1){
      this.dispatch.call("renderEnd", this);
    }
  }
}
