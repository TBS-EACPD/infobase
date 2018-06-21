"use strict";
exports = module.exports = require("../charts/common_charts_utils");

// The charts_index graphs were created with an intent of using them even
// outside of this application, therefore, there are no linkages
// between the graphs and the InfoBase. Accordingly, this adapter
// file is needed to provide extra information from the application
// to the graphs in a neutral format 

require('../charts/charts.scss');

const {trivial_text_maker} = require('../models/text.js');
const FORMAT = require('./format');
const UTILS = require("./utils");
const charts_index = exports;
charts_index.make_unique = UTILS.make_unique;
charts_index.BAR = require("../charts/bar");
charts_index.HBAR = require("../charts/hbar");
charts_index.CIRCLE = require("../charts/circle_chart");
charts_index.PIE = require("../charts/pie");
charts_index.PIE_OR_BAR = require("../charts/pie_or_bar");
charts_index.SAFE_PROGRESS_DONUT = require("../charts/safe_progress_donut.js");
charts_index.LINE = require("../charts/line");
charts_index.CANADA = require("../charts/canada");
charts_index.ARROW  = require("../charts/arrow");
charts_index.PACK  = require("../charts/pack");
charts_index.HEATMAP  = require("../charts/heatmap");
charts_index.CONCEPTEXPLORE  = require("../charts/concept-explorer");
charts_index.HBAR_Composition = require("../charts/hbar_composition");
charts_index.PROGRESS_DONUT = require("../charts/progress_donut");
charts_index.TWO_SERIES_BAR = require("../charts/two_series_bar");
//this is currently not used, treemap should not necessarily be deleted though.
//charts_index.TREEMAP  = require("../charts/treemap");
window.charts_index = charts_index;
var formats = FORMAT.formats;


const { reactAdapter } = require('./reactAdapter.js');
const { TextMaker } = require('../util_components.js');

charts_index.templates = trivial_text_maker;

charts_index.create_graph_with_legend = function(options){
  //
  // the potential values for options are:
  // * `get_series_label` :  will extract the label from each data item 
  // * `get_data` :  extract the data from each
  // * `data` :  data will be a list of objects in the following
  //    format
  //    ```
  //    data = [
  //      { active : true/false,
  //        data : [values],
  //        label : "series label"
  //      }
  //    ]
  //    ```
  // * `yaxis_formatter` : a number formatter, 
  // * `legend_title` : a title for the graph legend
  // * `ticks` : the graph ticks,
  // * `title` : a string,
  // * `text` : text to describe the graph, can be either string
  // or a node,
  // * `onRenderEnd` : a function which will be called once the graph
  //   has finished rendering
  // * legend_class : a string with a class or classes applied to the legend
  //  * `colors` : this desired color scale,
  //  * `stacked` : force the stacked display
  //     **warning, forcing a stack of negative values
  //     will result in strange display**
  // * `normalized` : default the graph as normalized on page load
  // *  `graph_areas` :  [
  //       ["Area Title" , start-x, end-x],
  //       ["Area Title" , start-x, end-x],
  //       ...
  //    ] , used to divide up a graph into different areas, for example
  //    historical/planning
  // * `yTop` : pre-calculated upper y-axis value, only used for line graphs. 
  //   Note: setting the y-axis scale with passed options does mean that the scale won't adjust if the graph is updated
  // * `yBottom` : pre-calculated lower y-axis value, only used for line graphs.
  //   Note: setting the y-axis scale with passed options does mean that the scale won't adjust if the graph is updated
  // * `no_toggle_graph` : prevents the default "Toggle Graph Type" button in bar graph legends
  //
  // compute if all of the data items has active status
  const all_active = options.all_active || _.every(options.data,"active");
  // compute if all of the data items are inactive
  const all_inactive = options.all_inactive || _.every(options.data,function(d){return d.active === false;});
  const graph_area = options.graph_area || this.panel.areas().graph; 
    
  let yaxis = options.y_axis;
  const yaxis_formatter = options.yaxis_formatter || formats.compact_raw;
  const legend_title = options.legend_title ?
    options.legend_title :
    undefined;
  let graph;
  let stacked;
  let normalized = options.normalized || false;
  let y_bottom = options.yBottom || false;
  let y_top = options.yTop || false;
  let data;
  let list;
  let data_to_series_format;
  let colors = options.colors;
  options.legend_class = options.legend_class || 'fcol-sm-11 fcol-md-11';

  options.get_series_label= options.get_series_label || _.property('label');
  options.sort_data = _.isUndefined(options.sort_data) ? true :  options.sort_data;
  if (options.data.length === 0 ){
    return false;
  }

  // transform the data
  data = _.chain(options.data)
    .map(row => ({
      label : options.get_series_label(row),
      data : options.get_data(row),
      active : all_active ? true :row.active,
    }));
  if (options.sort_data) {
    data = data.sortBy(d =>  -d3.sum(d.data) );
  }
  data = data.value();

  if(!window.is_a11y_mode){
    // if all the numbers are positive, then default to
    // displaying to them in a stacked format  and add
    // the extra option for percentage based display
    if (_.isUndefined(options.stacked)){
      stacked = _.every(data, d => _.every(d.data, dd =>  dd >= 0));
    } else {
      stacked = options.stacked;
    }

    // pick the best set of colours
    if(_.isUndefined(colors)){
      if (options.data.length <= 10){
        colors = infobase_colors();
      } else {
        // colors = d3.scale.category20();
        colors = d3.scaleOrdinal(d3.schemeCategory20);
      }
    }

    // establish the domain of the color scale
    colors.domain(_.map(data,_.property("label") ));

    // create the list as a dynamic graph legend

    list = charts_index.create_list(graph_area.select(".x1").node(), data, {
      html : _.property("label"),
      align : options.align,
      legend_class : options.legend_class,
      orientation : options.legend_orientation,
      colors : colors,
      interactive : true,
      title : legend_title,
      height : 500,
      legend : true,
      ul_classes : "legend",
    });


    if (options.bar && !options.no_toggle_graph && data.length > 1 && options.legend_orientation !== "horizontal"){
      // add button to cycle ("toggle"?) graph type for bar graphs (between stacked, stacked & normalized, and non-stacked)
        
      yaxis = normalized ? "%" : options.y_axis;
      
      list.legend
        .append("span","ul")
        .classed("centerer",true)
        .style("padding-bottom", "15px")
        .append("button")
        .classed("btn-ib-primary",true)
        .on("click",() => {
          normalized = !normalized && stacked;
          stacked = !stacked || normalized;
          graph.render({
            stacked : stacked,
            normalized : normalized,
            y_axis : normalized ? "%" : options.y_axis,
          });
        })
        .append("span")
        .html(trivial_text_maker("toggle_graph"));
    }
    data_to_series_format =  (all_active ?  _.chain(data)
      .map(function(obj){ return [obj.label,obj.data];})
      .fromPairs()
      .value() : {});

    
    // create the graph
    if (options.bar){
      graph = new charts_index.BAR.bar(graph_area.select(".x2").node(),{
        y_axis : yaxis,
        colors : colors,
        ticks : options.ticks,
        stacked : stacked,
        graph_areas : options.graph_areas,
        normalized : normalized,
        formater : yaxis_formatter,
        normalized_formater : formats.percentage_raw,
        series :  data_to_series_format,
      });
    } else {
      graph = new charts_index.LINE.ordinal_line(graph_area.select(".x2").node(),{
        y_axis : yaxis,
        colors : colors,
        ticks : options.ticks,
        stacked : stacked,
        add_line_diff : options.add_line_diff,
        graph_areas : options.graph_areas,
        normalized : normalized,
        formater : yaxis_formatter,
        normalized_formater : formats.percentage_raw,
        series : data_to_series_format,
        yBottom : y_bottom,
        yTop : y_top,
      });
    }

    if (options.onRenderEnd) {
      graph.dispatch.on("renderEnd", options.onRenderEnd);
    }
    if (_.isFunction(options.on_render_end)){
      graph.dispatch.on("renderEnd", options.on_render_end);
    }

    // hook the list dispatcher up to the graph
    list.dispatch.on("click", charts_index.on_legend_click(graph,colors));

    if (!all_active && data[0].active) {
    // simulate the first item on the list being selected twice, so that, if it was already active but not all other items are active, it stays active 
      list.dispatch.call("click","", data[0],0,list.first,list.new_lis);
      list.dispatch.call("click","",data[0],0,list.first,list.new_lis);

    } else if (!all_inactive && !data[0].active) {
      // simulate the first item on the list being selected twice, so that, if it was already inactive and not all other items are inactive, it stays inactive 
      list.dispatch.call("click","",data[0],0,list.first,list.new_lis);
      list.dispatch.call("click","",data[0],0,list.first,list.new_lis);

    } else if (all_inactive) {
      // simulate the first item on the list being selected when all items are inactive
      list.dispatch.call("click","",data[0],0,list.first,list.new_lis);

    } else {
      graph.render({});
    }

  }
  
  // Add a11y table
  if (window.is_a11y_mode) {
    const a11y_table_title = options.a11y_table_title || "";
    
    charts_index.create_a11y_table({
      container: graph_area, 
      label_col_header: legend_title, 
      data_col_headers: options.ticks, 
      data, 
      table_name: a11y_table_title,
    });

    return;

  }
  return graph;
};

charts_index.create_a11y_table = function({
  container,  //
  data, 
  label_col_header,  //optional
  data_col_headers, 
  table_name, //optional
}){
  //
  // Adds a11y tables to panels
  //
  // Arguments:
  //   container : where the a11y table will be appended. In most cases, this is this.panel.areas().graph, BUT if the
  //   graph area layout only has one section, then this.panel.areas().graph itself is an aria-hidden element so appending
  //   the a11y table there is pointless. In that case, probably want to pass this.panel.areas().text
  //   label_col_header : header for column of data labels (ie. legend_title in create_graph_with_legend)
  //   data_col_headers : headers for columns of data (ie. ticks, for most graphs)
  //   data : table data, formatted as in the following example
  //     [
  //       {
  //         label : "Indeterminate",
  //         data : [5721, 5089, 4405, 4204, 4098]
  //       },
  //       {
  //         ...
  //       },
  //       ...
  //     ]
  if(_.isElement(container)){ //if container is not a d3 selection, wrap it in a d3 selection
    container = d3.select(container);
  }
  const a11y_area = container.append('div');
  if(!window.is_a11y_mode){
    a11y_area.attr('class','sr-only');
  }
  
  // Note: strips html from tick (ie. the </br> in most people year ticks)
  const table_content = <div style={{overflow: "auto"}}>
    <table
      className="table table-striped table-bordered"
    >
      <caption>
        <div> 
          { 
            !_.isEmpty(table_name) ? 
            table_name : 
            <TextMaker text_key="a11y_table_title_default" />
          }
        </div> 
      </caption>
      <thead>
        <tr>
          <th 
            scope={
              label_col_header ? 
              "col" :
              null
            }
          >
            {label_col_header || ""}
          </th>
          {_.map(data_col_headers, (tick,i) => <th key={i}> <span dangerouslySetInnerHTML={{__html:tick}} /> </th>)} 
        </tr>
      </thead>
      <tbody>
        {_.map(data, ({label, data}) => 
          <tr key={label}>
            <th 
              scope={
                !label_col_header ?
                "row" :
                null
              }
            >
              {label}
            </th>
            {
              _.isArray(data) ? 
              _.map(data, (d,i) => <td key={i}> {d} </td> ) :
              <td> {data} </td>
            }
          </tr>
        )}
      </tbody>
    </table>
  </div>;


  reactAdapter.render(table_content, a11y_area.node());
};
