exports = module.exports;
require("./table107.ib.yaml");

const {sos} = require('../../models/businessConstants.js');

const {
  sobj_dimension,
  major_vote_stat,
  vote_stat_dimension,
  years: {
    std_years,
  },
  Statistics,
} = require('../table_common.js');
var D3 = require("../../core/D3");
var HEATMAP = D3.HEATMAP;
var HBAR = D3.HBAR;

const { PanelGraph } = require('../../core/PanelGraph.js');

const {text_maker} = require("../../models/text");
const {run_template} = require('../../models/text');
var FORMAT = require('../../core/format');

var formats = FORMAT.formats;
var m = run_template;

module.exports = {
  "id": 'table107',
  "classification" : "not_public",
  "tags" : [
    "VOTED",
    "SOBJ",
    "PA",
    "EXP",
  ],
  "name": { 
    "en":  "Expenditures by Standard Object by Vote",      
    "fr":  "Dépenses par article courant par crédit",
  },
  "title": { 
    "en": "Expenditures by Standard Object by Vote from {{pa_last_year_5}} to {{pa_last_year}} ($000)",      
    "fr": "Dépenses par article courant par cédit de {{pa_last_year_5}} à {{pa_last_year}} (000 $)",
  },
  "add_cols": function(){
    this.add_col(
      { "nick" : "dept",
        "type":"int",
        "key" : true,
        "hidden" : true,
        "header":'',
      });
    this.add_col(
      { "nick" : "votenum",
        "type":"str",
        "key" : true,
        "hidden" : true,
        "header":{
          "en":"Vote",
          "fr":"Crédit",
        },
      });
    this.add_col( { 
      "nick" : "votestattype",
      "type":"int",
      "key" : true,
      "hidden" : true,
      "header":'',
    });
    this.add_col(
      { "nick" : "sobjID",
        "type":"int",
        "key" : true,
        "hidden" : true,
      });    
    this.add_col( { 
      "nick" : "desc",
      "type":"wide-str",
      "key" : true,
      "header": {
        "en" : "Vote Description",
        "fr" : "Description du Vote",
      },
    });
    this.add_col(
      { "nick" : "sobj_name",
        "type":"wide-str",
        "key" : true,
        "header": {
          "en": "Standard Object",
          "fr": "Article cours",
        },
      });    
    _.each(std_years, (year,i)=>{
      this.add_col({
        "nick": year,
        "hidden": i< 2,
        "simple_default": i===4,
        "type": "big_int",
        "header": year,
        "description": {
          "en": "Fiscal Year " + year,
          "fr": "Exercice " + year,
        },
      });
    });
  },
  "sort" : function(mapped_rows, lang){
    return _.sortBy(_.sortBy(mapped_rows, function(row){
      return row.sobjID;
    }), function(row){
      return +row.votenum? +row.votenum : 999;
    });
  },
  "queries" : { },
  "dimensions" : [
    {
      filter_func :  sobj_dimension,
      title_key :"so",
      include_in_report_builder : true,
    },
    {
      filter_func :  major_vote_stat,
      title_key : "major_voted_stat",
      include_in_report_builder : true,
    },
    {
      filter_func :  vote_stat_dimension,
      title_key :"voted_stat",
      include_in_report_builder : true,
    },
  ],
  "mapper": function (row) {
              
    row.splice(4,0,text_maker("vstype"+row[2])) ;
    // splice in sos[row[3]] at 5th position
    row.splice(5,0,sos[row[3]].text);

    // replace "S" with "Stat." for ease of reading
    if (row[1] === "S"){ 
      row.splice(1,1,"Stat.");
    } else {
      row[4] += " - " + row[1];
    }
    return row;
  },
  "details" : {},
};


Statistics.create_and_register({
  id: 'table107_dept_info', 
  table_deps: [ 'table107'],
  info_deps: ['table4_dept_info'],
  level: 'dept',
  compute: (subject, table_deps, info_deps, add, c) => {
    const  q = table_deps.table107.q(subject);
    const t4_info = info_deps.table4_dept_info;

    var top_so_vote_row = _.max(q.data, function(row){
      return row["{{pa_last_year}}"];
    });

    add({
      type : "text",
      value: top_so_vote_row.sobj_name,
      key :"so_vote_top_so",
    });
    add({
      type : "text",
      value: top_so_vote_row.desc,
      key :"so_vote_top_vote",
    });
    add("so_vote_top_spend_pa_last_year",top_so_vote_row["{{pa_last_year}}"]);
    add(
      "so_vote_top_spend_pa_last_year_pct",
      top_so_vote_row["{{pa_last_year}}"] / t4_info.dept_exp_pa_last_year
    );

  },
})



new PanelGraph({
  level: "dept",
  depends_on: ['table107'],
  key : "five_year_avg_so_by_vote",
  height: 500,

  layout : {
    full : {text : 12, graph: [5,7]},
    half : {text : 12, graph: [12,12]},
  },

  info_deps: ['table107_dept_info'],
  title :"so_by_vote_graph_title",
  text : "so_by_vote_graph_text",

  calculate(subject){
    const {table107} = this.tables;
    return { q_data : table107.q(subject).data };
  },

  render(panel, data,options){
    const {graph_args} = data;
    const q_data = graph_args.q_data;
    var explaining_area = panel.areas().graph.select(".x1");
    // pick a slightly smaller span for the explanation areas
    var legend_area = explaining_area.append('div').classed("col-md-10",true);
    var secondary_graph_container = explaining_area
      .append("div")
      .classed("col-md-10",true)
      .styles({
        "border":"1px solid #CCC" ,
        "margin-top" : "20px", 
      });

    const main_area = panel.areas().graph.select(".x2");
    main_area.append('div');
    const graph_area = main_area.append('div');
    let graph_series = _.chain(q_data)
      .map(row => ({
        x_sort : +row.votenum ? +row.votenum : 999,
        y_sort :-row.sobjID,
        title : row['desc'] + " / " + row.sobj_name,
        historical_data : std_years.map(col => ({name : m(col), value : row[col]}) ),
        y : row.sobj_name,
        x : row.desc,
        z: row["{{pa_last_year}}"],
      }) 
      )
      .value();
    var x_vals = _.chain(graph_series)
      .sortBy("x_sort")
      .map("x")
      .uniqBy()
      .value();
      
    var y_vals = _.chain(graph_series)
      .sortBy("y_sort")
      .map("y")
      .uniqBy()
      .value();  
    var z_vals = _.uniqBy(_.map(graph_series, "z"));
    var z_extent = d3.extent(z_vals);
    z_extent[0] *= -1;
    var max_abs = d3.max(z_extent);
    // can't feed negative values into the sqrt scale
    var neg_color_scale = d3.scaleSqrt()
      .domain([-max_abs,0])
      .range([1,0]);
    var pos_color_scale = d3.scaleSqrt()
      .domain([0,max_abs])
      .range([0,1]);
    var formater =  formats["big_int_real_raw"];


    var heatmap_options = {
      data: graph_series,
      x_values : x_vals,
      y_values : y_vals,
      margin : {
        top : 60,
        left : 150,
        bottom : 5,
        right : 5,
      },
      height : 2*this.height,
      pos_color_scale : pos_color_scale,
      neg_color_scale : neg_color_scale,
      hover_formatter : formats['compact_raw'],
    };
    graph_area.style("height", heatmap_options.height + "px");


    var heatmap_graph =(new HEATMAP.heatmap(graph_area.node(), heatmap_options)).render(); 

    //  add legend
    // 1. get three ticks from positive and three from negative 
    // 3 . combine them and remove the double 0
    var legend_items = _.chain(pos_color_scale.ticks(5).reverse().concat(neg_color_scale.ticks(2).reverse()))
      .uniqBy()
      .map(tick => ({label: tick, active:true}) )
      .value();
       
    D3.create_list(
      legend_area.node(),
      legend_items,
      {html : d => formater(d.label), 
        legend : true,
        width : "100%",
        title : text_maker("legend"),
        ul_classes : "legend",
        interactive : false,
        colors : (label)=>{
          let val = accounting.unformat(label),
            opacity,
            color;
          if (val >= 0){
            color = heatmap_graph.pos_color;
            opacity= pos_color_scale(val);
          }else {
            color = heatmap_graph.neg_color;
            opacity= neg_color_scale(val);
          }
          return `rgba(${color},${opacity})`;
        },
      });

    heatmap_graph.dispatch.on('dataClick',(el, d) => {

      secondary_graph_container.selectAll("*").remove();

      secondary_graph_container.append("p")
        .html(`${text_maker("five_year_history")} ${d.name}`)
        .styles({
          margin:"0 auto",
          "font-weight":"500",
        });
      // add in the require div with relative positioning so the
      // labels will line up with the graphics

      var actual_graph = secondary_graph_container.append("div")
        .styles({
          "margin-bottom":"10px",
          position:"relative",
        });

      (new HBAR.hbar( actual_graph.node(), {
        x_scale : d3.scaleLinear(),
        axisFormater : formater,
        formater : formater,
        tick_number : 5,
        pos_color : `rgb(${heatmap_graph.pos_color})`,
        data : d.historical_data,
      })).render({});

    });

  },
});
