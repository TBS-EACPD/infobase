const {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  D3,
} = require("./shared"); 

const { abbrev } = require('../core/utils.js');

const { 
  CIRCLE, 
  ARROW, 
  PACK, 
} = D3;

//these 2 graphs are currently turned off and I don't know what they're supposed to look like.
//new PanelGraph({
//  level: "gov",
//  key: 'qfr_universe',
//  info_deps: ['table1_gov_info'],
//  depends_on: "table1",
//  height: 300,
//
//  layout: {
//     full : {text : 8, graph : 4},
//     half : {text : 12, graph : 12},
//  },
//
//  title : "gov_qfr_intro_title",
//  text :  "gov_qfr_intro_text",
//
//  calculate(subject,info){
//    return {
//      data_to_graph : [
//         { value: info.gov_tabled_qfr_in_year,name :'y'},
//         { value: info.gov_qfr_auth_this_year,name :'x'}
//      ]
//    };
//  },
//
//  render(panel,data){
//    return new CIRCLE.circle_pie_chart( 
//      panel.areas().graph,
//      {
//        margin : {
//          top: window.lang === 'en' ? 50 : 80,
//          right: 10,
//          bottom: 20,
//          left: 10
//        },
//        height : this.height,
//        formater : formats.compact1,
//        font_size : "16",
//        title : text_maker("qfr_proportion_of_whole"),
//        data : data.data_to_graph
//      }
//  );
//  }
//});
//
//
//new PanelGraph({
//  level: "dept",
//  key :  "qfr_universe",
//  info_deps: [
//    'table1_dept_info',
//    'table1_gov_info'
//  ],
//  depends_on: 'table1',
//  height: 300,
//
//  layout: {
//   full : {text : 12, graph : undefined},
//   half : {text : 12, graph : undefined},
//  },
//
//  title :  "dept_qfr_intro_title",
//  text :  "dept_qfr_intro_text",
//
//  calculate(subject,info){
//    return { subject, data: info, table: this.table}
//  },
//
//  render(data,options){
//
//
//
//  }
//});

function qfr_spend_comp_render(panel,calculations ) {
  const { graph_args } = calculations;
  const { this_year_data , last_year_data } = graph_args;

  new CIRCLE.circle_pie_chart(
    panel.areas().graph.select(".x1").node(), 
    {
      data : this_year_data,
      formater : formats.compact1,
      height : this.height,
      font_size : 16,
      title : run_template("{{qfr_in_year}}"),
    }).render();

  new CIRCLE.circle_pie_chart(
    panel.areas().graph.select(".x2").node(),  
    {
      data : last_year_data,
      formater : formats.compact1,
      font_size : 16,
      height : this.height,
      title : run_template("{{qfr_last_year}}"),
    }).render();

}


new PanelGraph({
  depends_on: ['table1'],
  level: 'gov',

  info_deps: [
    'table1_gov_info',
  ],

  key : "qfr_spend_comparison",
  height : 300,

  layout : {
    full :{text : 4,  graph : [4,4]},
    half : {text : 12, graph : [6,6]},
  },

  title :   "qfr_spend_comparison_title",
  text :  "gov_qfr_spend_comparison_text",

  calculate(gov, info){
    return {
      this_year_data : [
        {name: 'x', value : info.gov_qfr_auth_this_year},
        {name: 'y', value : info.gov_qfr_spend_this_year},
      ],
      last_year_data : [
        {name: 'x', value : info.gov_qfr_auth_last_year},
        {name: 'y', value : info.gov_qfr_spend_last_year},
      ],
    };
  },

  render: qfr_spend_comp_render,
})

new PanelGraph({
  depends_on: ['table1'],

  info_deps: [
    'table1_gov_info',
    'table1_dept_info',
  ],

  key : "qfr_spend_comparison",
  level: 'dept',
  height : 300,

  layout : {
    full :{text : 4,  graph : [4,4]},
    half : {text : 12, graph : [6,6]},
  },

  title : "qfr_spend_comparison_title",
  text :  "dept_qfr_spend_comparison_text",

  calculate(dept,info){
    return {
      this_year_data : [
        {name: 'x', value : info.dept_qfr_auth_this_year},
        {name: 'y', value : info.dept_qfr_spend_this_year},
      ],
      last_year_data : [
        {name: 'x', value : info.dept_qfr_auth_last_year},
        {name: 'y', value : info.dept_qfr_spend_last_year},
      ],
    };
  },

  render: qfr_spend_comp_render,
})

function qfr_perc_change_render(panel, calculations){
  const{ graph_args } = calculations;

  new ARROW.arrows(
    panel.areas().graph.node(),
    {
      margin : {top : 10, bottom: 10,left:20,right:20},
      data : graph_args,
      formater : formats.percentage1_raw,
      height : this.height,
    }
  ).render();

}

new PanelGraph({
  depends_on: ['table1'],

  info_deps: [
    'table1_gov_info',
  ],

  key : "qfr_percentage_change",
  level: 'gov',
  height : 300,

  layout : {
    full :{text : 7,  graph : 5},
    half : {text : 12, graph : 12},
  },

  text :  "gov_qfr_percentage_change_text",
  title : "qfr_percentage_change_title",

  calculate(subject,info){
    return [
      {value: info.gov_qfr_auth_change, name : text_maker("authorities")},
      {value: info.gov_qfr_spend_change, name : text_maker("expenditures")},
    ];
  },

  render: qfr_perc_change_render,
})

new PanelGraph({
  depends_on: ['table1'],

  info_deps: [
    'table1_gov_info',
    'table1_dept_info',
  ],

  key : "qfr_percentage_change",
  level: 'dept',
  height : 300,

  layout : {
    full :{text : 7,  graph : 5},
    half :{text : 12, graph : 12},
  },

  text :  "dept_qfr_percentage_change_text",
  title : "qfr_percentage_change_title",

  calculate(subject,info){
    return [
      {value: info.dept_qfr_auth_change, name : text_maker("authorities")},
      {value: info.dept_qfr_spend_change, name : text_maker("expenditures")},
    ];
  },

  render: qfr_perc_change_render,
});


new PanelGraph({
  level: "dept",

  info_deps: [
    'table2_dept_info',
    'table2_gov_info',
  ],

  key : "qfr_by_so",
  depends_on: ['table2'],

  layout : {
    full : {text:6,graph:6},
    half: {text:12,graph:12},
  },

  title: "qfr_by_so_title",
  text : "qfr_by_so_text",

  calculate(dept,info){
    const { table2 } = this.tables;
    if(_.isEmpty(table2.q(dept).data)){
      return false;
    }
    return true;
  },

  render(panel,data){
    const { subject } = data;

    const {table2} = this.tables;
    const pre_packing_data = _.chain(table2.horizontal("in_year_ytd-exp",subject.id,true))
      .toPairs()
      .map(x =>  ({value:x[1],name:x[0]}) )
      .value();

    D3.create_a11y_table({
      container: panel.areas().text, 
      label_col_header : text_maker("so"), 
      data_col_headers: [ table2.col_from_nick('in_year_ytd-exp').fully_qualified_name ] , 
      data : _.map(pre_packing_data, ({name, value}) => ({ 
        label: name, 
        data: [value], 
      })),
    });


    panel.areas().graph.attr('aria-hidden',true);

    const args = {
      zoomable: true,
      width : this.height*1.7,
      formater : formats.compact,
      invisible_grand_parent : false,
      hover_text_func : d => d.data.name + " - "+ formats.compact(d.value),
      text_func : d => {
        const val = formats.compact(d.value);
        if (d.zoom_r > 60) {
          return d.data.name + " - "+ val;
        } else if (d.zoom_r > 40) {
          return _.take(d.data.name.split(" "),2).join(" ")+ " - "+ val;
        } else {
          return abbrev(d.data.name + " - "+ val,5,false);
        }
      },
      data: PACK.pack_data(
        pre_packing_data,
        text_maker("other"),
        {
          force_positive : true,
          filter_zeros : true,
        }
      ),
    };

    new  PACK.pack(panel.areas().graph, args).render();
  },
});
