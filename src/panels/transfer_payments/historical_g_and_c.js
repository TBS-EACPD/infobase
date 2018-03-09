import './gnc-text.ib.yaml';
import {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  utils,
  years,
  D3,
} from "../shared";

const { std_years } = years;
const { find_parent } = utils;

const exp_years = std_years.map(year=> year+'exp');

const g_and_c_hist_render = function(panel, data){
  const {subject, graph_args, info} = data;
  const graph_area = panel.areas().graph;

  graph_area.append("div").classed("x1",true).style("display", "flex");
  graph_area.append("div").classed("x2",true).style("position", "relative");

  let graph_data = graph_args;

  if (subject.is("dept")){

    graph_data = graph_args.rolled_up;
    const g_and_c_data = graph_args.rows;
    const data_keys = Object.keys(g_and_c_data);
    // insert new row under the content row
    
    if(!window.is_a11y_e){
      const graph_parent = d3.select(find_parent(graph_area.node(),n=>d3.select(n).classed("panel-body"))); 
      const new_row = graph_parent.insert("div",".row.source")
        .classed("row",true)
        .html(text_maker("historical_g_and_c_custom_new_row",{data_keys}));
      
      new_row
        .select("select")
        .on("change", d => {
          //The currently selected option index is kept in a
          //property called selectedIndex on the select element.
          //Selections are arrays, so elements can be accessed
          //directly (e.g., selection[0][0]).
          const target = d3.event.target;
          const index = target.selectedIndex;
          draw_graph(new_row, g_and_c_data[target[index].value]);
        });
      
      draw_graph(new_row,g_and_c_data[data_keys[0]]);
    }

    // Add a11y tables
    data_keys.forEach(d =>
      D3.create_a11y_table({
        container: graph_area, 
        label_col_header :d, 
        data_col_headers : std_years.map(run_template),
        data: _.chain(g_and_c_data[d])
          .map(row => ({
            label : row.tp,
            data : std_years.map(year => row[year+"exp"]),
          })
          )
          .sortBy( x => -d3.sum(x.data))
          .value(),
        table_name: text_maker("historical_g_and_c_title") + ", " + d,
      })
    );
  }
  
  const to_graph = _.chain(graph_data)
    .map((values, key) =>
      ({
        label : key,
        data : values,
        active : true,
      })
    )
    .sortBy(x => -d3.sum(x.data))
    .value();


  D3.create_graph_with_legend.call({panel},{  
    get_data :  row => row.data,
    data :  to_graph,
    legend_orientation : "horizontal",
    y_axis : "($)",
    ticks : info.last_years,
    legend_title : "transfer_payment_type",
  });
};

const draw_graph = function(area, data){
  const legend_area =area.select(".x1");
  const graph_area = area.select(".x2");
  const colors = infobase_colors();

  // remove evreything from the legend and graph area to be redrawn
  area.selectAll(".x1 .d3-list, .x2 *").remove();

  const mapped_data = _.chain(data)
    .map(row => ({
      label : row.tp,
      data : std_years.map(year => row[year+"exp"] ),
      active : false,
    }))
    .sortBy( x => -d3.sum(x.data))
    .value();

  // create the list as a dynamic graph legend
  // debugger;

  const list = D3.create_list(legend_area.node(), mapped_data, {
    html : d => d.label,
    colors : colors,
    width : "400px",
    interactive : true,
    height : 400,
    title : mapped_data[0].type,
    legend : true,
    ul_classes : "legend",
    multi_select : true,
  });
  // create the graph

  const graph = new D3.LINE.ordinal_line(
    graph_area.node(),
    {
      ticks : std_years.map(run_template),
      formater : formats.compact_raw,
      height : 400,
      y_axis : "($)",
    });

  // hook the list dispatcher up to the graph
  list.dispatch.on("click", D3.on_legend_click(graph,colors));
  // simulate the first item on the list being selected
  list.dispatch.call("click","",mapped_data[0],0,list.first,list.new_lis);
}


new PanelGraph({
  level: "gov",
  key : "historical_g_and_c",
  info_deps: [
    'table7_gov_info',
  ],
  depends_on : ['table7'],
  height : 375,

  layout : {
    full : {text : 4, graph: 8},
    half: {text : 12, graph: 12},
  },

  title : "historical_g_and_c_title",
  text :  "gov_historical_g_and_c_text",

  calculate(subject){
    const {table7} = this.tables;
    return table7.payment_types(exp_years,false);
  },

  render: g_and_c_hist_render,
});

new PanelGraph({
  level: "dept",
  depends_on : ['table7'],
  info_deps: [
    'table7_gov_info',
    'table7_dept_info',
  ],
  key : "historical_g_and_c",
  footnotes: ['SOBJ10'],
  height : 375,

  layout : {
    full : {text : 6, graph: 6},
    half: {text : 12, graph: 12},
  },

  title : "historical_g_and_c_title",
  text : "dept_historical_g_and_c_text",

  calculate(dept){
    const {table7} = this.tables;

    return {
      rolled_up : table7.payment_types(exp_years,dept.unique_id),
      rows : table7.payment_types(exp_years,dept.unique_id,false),
    };
  },

  render: g_and_c_hist_render,
});

