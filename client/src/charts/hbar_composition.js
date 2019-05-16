import common_charts_utils from './common_charts_utils';

export class HBarComposition {
  constructor(container, options){
    // expect data to be in following format:
    // ```javascript
    //  {
    //    data: [
    //      {data: 'data', "label": "label"},
    //      {data: 'data', "label": "label"},
    //      {data: 'data', "label": "label"},
    //    ],
    //    color: color
    //  }
    // ```
    //  if the data is an array, the graph will be drawn as a stacked, 
    //  horizontal bar chart with equal sized bars showing the relative 
    //  split
    //
    common_charts_utils.setup_graph_instance(this, d3.select(container), options);
    this.graph_area = this.svg.append("g").attr("class", "_graph_area");
    // keep reference to container to modify the height based on the number of 
    // bars to be drawn
    this.container = d3.select(container);
  }

  render(options){
    this.options = _.extend(this.options,options);
    const formatter = this.options.formatter;
    const non_std_formatter = this.options.non_std_formatter;
    const bar_height = this.options.bar_height || 30;
    const font_size = this.options.font_size || "10px";
    const percentage_mode = this.options.percentage_mode;
    const bar_height_dy = 2;
    const label_pct = 0.3;
    const margin = this.options.margin || {top: 20,
      right: 20,
      bottom: 30,
      left: 20};
    const bar_label_formatter = _.isFunction(this.options.bar_label_formatter) ? this.options.bar_label_formatter : _.identity;
    const get_series_label = d => d.label;
    let x_max = -Infinity;
    let x_min = Infinity;
    const data = _.chain(this.options.data)
      .each(d => {
        const values = _.map(d.data,"data");
        d.positive_sum = d3.sum( values.filter(v => v > 0) );
        d.negative_sum = d3.sum( values.filter(v => v < 0) );
        d.abs_sum = d3.sum( values.map(Math.abs) );
        d.sum = d3.sum(values);
        x_max = d.positive_sum > x_max ? d.positive_sum : x_max;
        x_min = d.negative_sum < x_min ? d.negative_sum : x_min;
      })
      .filter(d => d.sum !== 0 )
      .sortBy(d => -d.sum) 
      .sortBy(d => -d.positive_sum) 
      .value();

    if(percentage_mode){
      x_max = 1;
      if(x_min > 0){ //allow negative percentages, but only if they really exist.
        x_min = 0;
      }
    }
    
    const get_el_width = (el) => {
      const temp_el = this.container
        .append("div")
        .attr("aria-hidden", "true")
        .html(el);
      const width = temp_el.node().firstChild.offsetWidth;
      temp_el.remove();
      return width;
    }
    
    const number_of_rows = data.length;
    const y_position = (d,i) => margin.top + bar_height_dy + i*(bar_height + bar_height_dy);
    const height = margin.top + number_of_rows * (bar_height + bar_height_dy);
    const width = this.outside_width - margin.left - margin.right;

    const neg_x_min_bar_pct = x_min < 0 ? 
      (get_el_width(formatter(x_min)) + 30)/width :
      0;
    const right_margin_pct = 0.075;
    const left_margin_pct = non_std_formatter || neg_x_min_bar_pct < right_margin_pct ? 
      right_margin_pct :
      neg_x_min_bar_pct;

    const graph_start = (label_pct + left_margin_pct ) * width;
    const x = d3.scaleLinear()
      .domain([0, Math.abs(x_min)+x_max])
      .range([0, (1 - label_pct - left_margin_pct - right_margin_pct) * width]);

    const colors = this.options.colors;

    this.container.styles({"height": height + margin.top + margin.bottom + "px"});

    // resize the svg if necessary
    this.svg
      .attrs({
        width: this.outside_width,
        height: height,
      });

    this.graph_area.selectAll("line.axis").remove();
    // add the axis line to separate negative from positive numbers
    this.graph_area.append("line")
      .classed("axis", true)
      .attrs({
        "x1": graph_start + x(-x_min),
        "x2": graph_start + x(-x_min),
        "y1": margin.top + 2,
        "y2": margin.top + height,
        "stroke": "black",
        "stroke-width": 2,
      });
    this.graph_area.append("line")
      .classed("axis", true)
      .attrs({
        "x1": label_pct * width+1,
        "x2": label_pct * width+1,
        "y1": margin.top + 2,
        "y2": margin.top + height,
        "stroke": "black",
        "stroke-width": 2,
      });

    // rather than remapping data, will just roll own primitive stacking
    // function

    _.each(data, d => {
      let posBase = x(-x_min);
      let negBase = x(-x_min);
      _.each(d.data, _d => {
        _d.width = x(Math.abs(_d.data));
        if (_d.data < 0) {
          _d.x = negBase;
          negBase -= _d.width
        } else {
          _d.x = posBase;
          posBase += _d.width
        }
      });
    }); 

    const bar_groups = this.graph_area
      .selectAll("g.bar-groups")
      .data(data, d => d.key);

    bar_groups.exit().remove();

    const new_bar_groups = bar_groups
      .enter()
      .append("g")
      .classed("bar-groups", true);


    const new_groups = bar_groups.merge(new_bar_groups)
      .attr("transform", (d,i) => `translate(${graph_start},${y_position(d,i)})`)
      .attr("data", get_series_label);
  
    const bars = new_groups
      .selectAll("rect")
      .data(d => d.data, get_series_label );
    
    bars
      .exit()
      .transition()
      .attrs({"width": 0})
      .remove();

    const new_bars = bars
      .enter()
      .append("rect")
      .classed("bar-slice",true)
      .attrs({
        "width": 0,
        "height": bar_height,
        "y": 0,
      });

    bars.merge(new_bars)
      .transition()
      .duration(1000)
      .attrs({
        "x": (d) => {
          if (d.data > 0){
            return d.x;
          } else {
            return d.x - d.width;
          }
        },
        "width": _.property("width"),
        "data": get_series_label,
        "fill": (d,i) => colors(get_series_label(d)),
      });


    const graph_labels = this.html.selectAll("div.graph-labels")
      .data(data, d => d.key);

    graph_labels.exit().remove();

    const new_graph_labels = graph_labels
      .enter()
      .append("div")
      .classed("graph-labels", true);

    graph_labels.merge(new_graph_labels)
      .styles({
        "left": "0px",
        "font-weight": "500",
        "width": `${width}px`,
        "position": "absolute",
      })
      .each(function(d){

        d3.select(this).html("");

        d3.select(this)
          .classed("bar-label", true)
          .append("div")
          .styles({
            "position": "absolute",
            "display": "flex",
            "font-size": font_size,
            "left": "0px",
            "width": (label_pct * width)- margin.left + "px",
            "height": bar_height + "px",
            "padding-right": "5px",
            "margin-left": margin.left + "px",
            "background-color": window.infobase_color_constants.backgroundColor,
          })
          .append("div")
          .styles({
            "align-self": "center",
            "width": "100%",
            "max-height": "100%",
            "overflow-y": window.innerWidth < 991 ? "scroll" : "hidden",
            "text-align": "right",
            "padding-right": "5px",
          })
          .html(bar_label_formatter);

        if ( d.positive_sum > 0) {
          d3.select(this)
            .append("div")
            .styles({
              "position": "absolute",
              "display": "flex",
              "height": bar_height + "px",
              "align-self": "center",
              "font-size": font_size,
              "color": "black",
              "left": d => graph_start + x(-x_min) + x(d.positive_sum) + 10 + "px",
            })
            .append("div")
            .styles({
              "align-self": "center",
            })
            .classed("bar-amount-pos", true)
            .html(
              non_std_formatter ? 
                non_std_formatter({ 
                  positive_sum: d.positive_sum, 
                  data: d, 
                }) : 
                formatter(d.positive_sum)
            );
        }

        if ( d.negative_sum < 0) {
          d3.select(this)
            .append("div")
            .styles({
              "position": "absolute",
              "display": "flex",
              "height": bar_height +"px",
              "align-self": "center",
              "font-size": font_size,
              "text-align": "right",
              "color": "black",
              "margin-left": '10px',
              "right": d => width - graph_start - x(-x_min) + 20 + x(-d.negative_sum) + "px",
            })
            .append("div")
            .styles({
              "align-self": "center",
            })
            .classed("bar-amount-neg", true)
            .html(
              non_std_formatter ? 
                "" : 
                formatter(d.negative_sum)
            );
        }
      })
      .transition()
      .duration(1000)
      .styles({
        "top": (d,i) => y_position(d,i) + "px", 
      });
  }
};