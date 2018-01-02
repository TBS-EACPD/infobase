const {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  create_ppl_share_pie,
  create_height_clipped_graph_with_legend, 
  years : {people_years},
  business_constants : { FOL },
} = require("./shared"); 

const employee_fol_render = function(panel, data){
  const {graph_args, subject } = data;

  if ( (graph_args.length === 1) && (graph_args[0].label === FOL.sup.text) ){
    // If all data in last five years suppressed, replace text and graph with suppression explanation
    const text_node = panel.areas().text.node();
    const text_parent_node = text_node.parentNode;
    
    // Give text node full panel width
    text_parent_node.classList.remove("col-md-7");
    text_parent_node.classList.add("col-md-12");
    
    // Insert suppression explanation text
    text_node.innerHTML = text_maker("employee_FOL_all_suppressed_desc", {dept_name: subject.sexy_name});
    
  } else {

    if (this.level === "dept"){
      const create_graph_with_legend_options = {
        legend_col_full_size : 4,
        graph_col_full_size : 8,
        graph_col_class : "height-clipped-bar-area",
        legend_class : 'col-sm-12 col-md-8 col-md-offset-1',
        y_axis : text_maker("employees"),
        ticks : _.map(people_years, y => `${run_template(y)}`),
        height : this.height,
        bar : true,
        yaxis_formatter : formats["big_int_real_raw"],
        legend_title : "FOL",
        get_data :  _.property("data"),
        data : graph_args,
        no_a11y : true, // prevent create_graph_with_legend from making the a11y table, it would be aria-hidden
        a11y_table_title : text_maker("historical_employee_fol_title"), // create_height_clipped_graph_with_legend still makes an a11y table separatly, outside of the height clipper
      };     
      
      // Inserts new row under the text/pie chart row containing bar graph, collapsed by a HeightCliper.
      create_height_clipped_graph_with_legend(panel,create_graph_with_legend_options);
    }

    // Create and render % share pie chart, either to the right of or below panel text
    create_ppl_share_pie({
      pie_area : panel.areas().graph,
      graph_args, 
      label_col_header : text_maker("FOL"),
    });
  }
};

new PanelGraph({
  level: "dept",
  depends_on : ['table303'],

  key : "historical_employee_fol",

  info_deps: [
    'table303_dept_info',
  ],

  layout : {
    full : {text : 12, graph: 12},
    half : {text : 12, graph: 12},
  },

  text: "dept_historical_employee_fol_text",
  title: "historical_employee_fol_title",

  calculate(dept,info){
    const {table303} = this.tables;
    return table303.q(dept).data
      .map(row =>
        ({
          label : row.fol,
          data : people_years.map(year =>row[year]),
          five_year_percent : row.five_year_percent,
          active : true,
        })
      )
      .filter(d => d4.sum(d.data) !== 0 );
  },

  render: employee_fol_render,
});

new PanelGraph({
  level: "gov",
  depends_on : ['table303'],
  key : "historical_employee_fol",

  info_deps: [
    'table303_gov_info',
  ],

  layout : {
    full : {text : 12, graph: 12},
    half: {text : 12, graph: 12},
  },

  text: "gov_historical_employee_fol_text",
  title:"historical_employee_fol_title",

  calculate(gov,info){
    const {table303} = this.tables;
    return _.values(FOL)
      .map(FOL_type => {
        const FOL_text = FOL_type.text;
        const yearly_values = people_years.map(year => table303.horizontal(year,false)[FOL_text]);
        return {
          label : FOL_text,
          data :  yearly_values,
          five_year_percent : yearly_values.reduce(function(sum, val) { return sum + val;}, 0)/info.gov_five_year_total_head_count,
          active : true,
        };
      });
  },

  render: employee_fol_render,
});

