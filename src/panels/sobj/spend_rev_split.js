import './spend_rev_split.ib.yaml';

import {
  Statistics,
  formats,
  text_maker,
  PanelGraph,
  charts_index,
} from "../shared";

const is_revenue = so_num => +so_num > 19;
const last_year_col = "{{pa_last_year}}";

const sum_last_year_exp = rows => (
  _.chain(rows)
    .map( row => row[last_year_col] )
    .filter( _.isNumber )
    .reduce( (acc,item)=> acc+item , 0 )
    .value()
);


//given rows of std-obj-expenditure rows,  sums it up to return gross expenditures, net expenditures and revenue
const rows_to_rev_split = rows => {
  const [neg_exp, gross_exp] = _.chain( rows)
    .filter(x => x) //TODO remove this
    .partition( row => is_revenue(row.so_num) ) 
    .map(sum_last_year_exp)
    .value();  
  const net_exp = gross_exp + neg_exp;
  if (neg_exp === 0) { return false ;}
  return { neg_exp, gross_exp, net_exp };
};


function render(panel,calculations, options) {
  const { graph_args } = calculations;       
  const { neg_exp, gross_exp, net_exp } = graph_args; 
  const  series = { "": [ gross_exp, neg_exp] };
  const  _ticks = [ 'gross', 'revenues'  ];
  // if neg_exp is 0, then no point in showing the net bar
  if (neg_exp !== 0){
    series[""].push(net_exp);
    _ticks.push('net');
  }
  const ticks = _ticks.map(text_maker);

  if(window.is_a11y_mode){
    //all information is contained in text
    return;
  } else {
    new charts_index.BAR.bar(panel.areas().graph.node(),{
      series,
      ticks,
      add_xaxis : true,
      add_yaxis : false,
      add_labels : true,                                  
      x_axis_line : true,                                
      colors : infobase_colors(),
      formater : formats.compact1_raw,
      margin : {top: 20, right:20, left: 60, bottom: 80} ,
    }).render();
  }
  
}

const key = "spend_rev_split";
const title = "spend_rev_split_title";
const layout =  {
  full: {text: 5, graph: 7},
  half : {text: 12, graph: 12},
};

new PanelGraph({
  key,
  depends_on : ["table4","table5"],
  layout,
  footnotes : false,
  level : "dept",
  info_deps : ["table5_dept_info","table4_dept_info"],
  title,
  text :  "dept_spend_rev_split_text",
  calculate(subject,info,options){
    if ( info.dept_pa_last_year_rev === 0 ){
      return false;
    }
    return { neg_exp: info.dept_pa_last_year_rev,
      gross_exp : info.dept_pa_last_year_gross_exp,
      net_exp : info.dept_exp_pa_last_year,
    };
  },
  render,
});


Statistics.create_and_register({
  id: 'tag_revenue', 
  table_deps: [ 'table305'],
  level: 'tag',
  compute: (subject, tables, infos, add, c) => {
    const {table305} = tables;
    const prog_rows =  table305.q(subject).data;
    const exp_rev_results = rows_to_rev_split(prog_rows)

    add({
      key : "exp_rev_gross", 
      value : exp_rev_results.gross_exp,
    });

    add({
      key : "exp_rev_neg", 
      value : exp_rev_results.neg_exp,
    });

    add({
      key : "exp_rev_neg_minus", 
      value : -exp_rev_results.neg_exp,
    });

    add({
      key : "exp_rev_net", 
      value : exp_rev_results.net_exp,
    });

  },

});


Statistics.create_and_register({
  id: 'program_revenue', 
  table_deps: [ 'table305'],
  level: 'program',
  compute: (subject, tables, infos, add, c) => {
    const table305 = tables.table305;
    const prog_rows =  table305.programs.get(subject);
    const exp_rev_results = rows_to_rev_split(prog_rows)

    add({
      key : "exp_rev_gross", 
      value : exp_rev_results.gross_exp,
    });

    add({
      key : "exp_rev_neg", 
      value : exp_rev_results.neg_exp,
    });

    add({
      key : "exp_rev_neg_minus", 
      value : -exp_rev_results.neg_exp,
    });

    add({
      key : "exp_rev_net", 
      value : exp_rev_results.net_exp,
    });

  },

});

new PanelGraph({
  key,
  depends_on : ["table305"],
  info_deps : ["program_revenue"] ,
  layout,
  level : "program",
  title,
  text :   "program_spend_rev_split_text",
  calculate(subject,info,options){ 
    const {table305} = this.tables;
    const prog_rows = table305.programs.get(subject);
    const rev_split = rows_to_rev_split(prog_rows);
    if(rev_split.neg_exp === 0){
      return false;
    }
    return rev_split;
  },
  render,
});

new PanelGraph({
  key,
  depends_on : ["table305"],
  layout,
  level : "tag",
  info_deps : ["tag_revenue"] ,
  title,
  text :   "tag_spend_rev_split_text",
  calculate(subject,info,options){
    const {table305} = this.tables;
    const prog_rows =  table305.q(subject).data;
    const rev_split = rows_to_rev_split(prog_rows);
    if(rev_split.neg_exp === 0){
      return false;
    }
    return rev_split;
  },
  render,
});


