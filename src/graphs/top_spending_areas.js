const {
  Statistics,
} = require("../core/Statistics");

const {
  text_maker, 
  PanelGraph, 
  collapse_by_so,
  common_react_donut,
} = require("./shared"); 

const is_non_revenue = d => +(d.so_num) < 19;

const common_cal = (programs,table305) => {

  const cut_off_index = 3;
  const rows_by_so = collapse_by_so(programs, table305, is_non_revenue);

  if (rows_by_so.length <= 1) {
    return false;
  }
  const top_3_sos = _.take(rows_by_so,cut_off_index);
  const  remainder = (
    top_3_sos.length > cut_off_index -1 ? 
    {
      label : text_maker("other"), 
      value : d4.sum(_.tail(rows_by_so,cut_off_index),_.property("value")),
    } : 
    []
  );

  return top_3_sos.concat(remainder);       

};

Statistics.create_and_register({
  id: 'program_std_obj', 
  table_deps: [ 'table305'],
  level: 'program',
  compute: (subject, tables, infos, add, c) => {
    const {table305} = tables;

    const rows_by_so = collapse_by_so([subject], table305, is_non_revenue);
    const { 
      label : top_so_name, 
      value : top_so_amount,
    } = _.first(rows_by_so);

    const total_spent =  d4.sum(rows_by_so, _.property('value'))

    const top_so_pct = top_so_amount/total_spent;

    add("top_so_name", top_so_name);
    add("total_spent", total_spent);
    add("top_so_spent", top_so_amount);
    add("top_so_pct", top_so_pct);

  },
})


Statistics.create_and_register({
  id: 'tag_std_obj', 
  table_deps: [ 'table305'],
  level: 'tag',
  compute: (subject, tables, infos, add, c) => {
    const {table305} = tables;

    const rows_by_so = collapse_by_so(subject.programs, table305, is_non_revenue);
    const { 
      label : top_so_name, 
      value : top_so_amount,
    } = _.first(rows_by_so);

    const total_spent =  d4.sum(rows_by_so, _.property('value'))

    const top_so_pct = top_so_amount/total_spent;

    add("top_so_name", top_so_name);
    add("total_spent", total_spent);
    add("top_so_spent", top_so_amount);
    add("top_so_pct", top_so_pct);

  },
})


new PanelGraph({
  key: 'top_spending_areas',
  depends_on : ['table305'],
  info_deps : ["program_std_obj"],
  layout: {
    full: {text: 5, graph: 7},
    half : {text: 12, graph: 12},
  },
  level : "program",
  title : "top_spending_areas_title",
  text :  "program_top_spending_areas_text",
  calculate(subject,info,options){ 
    if(_.isEmpty(this.tables.table305.programs.get(subject))){
      return false;
    }
    return  common_cal([subject], this.tables.table305);
  },
  footnotes : ["SOBJ"],
  render: common_react_donut,
});

new PanelGraph({
  key: 'top_spending_areas',
  info_deps : ["tag_std_obj"],
  depends_on : ['table305'],
  layout: {
    full: {text: 5, graph: 7},
    half : {text: 12, graph: 12},
  },
  level : "tag",
  footnotes : ["SOBJ"],
  title : "top_spending_areas_title",
  text :  "tag_top_spending_areas_text",
  calculate(subject,info,options){ 

    return  common_cal(subject.programs, this.tables.table305);
  },
  render: common_react_donut,
});

