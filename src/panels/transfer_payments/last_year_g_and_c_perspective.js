import './gnc-text.ib.yaml';
import {
  Subject,
  formats,
  PanelGraph,
  charts_index,
} from "../shared";

new PanelGraph({
  level: "dept",
  key : "last_year_g_and_c_perspective",

  depends_on: ['table7'],
  footnotes: ['SOBJ10'],
  height: 300,

  layout : {
    full : {text : 6, graph: [3,3]},
    half: {text : 12, graph: [6,6]},
  },

  info_deps: ['table7_gov_info', 'table7_dept_info', 'table4_dept_info'],
  title : "last_year_g_and_c_perspective_title",
  text :  "dept_last_year_g_and_c_perspective_text",

  calculate(subject, info,options){
    return {
      data1 : [
        { value: info.gov_tp_exp_pa_last_year,name :'y'},
        { value: info.dept_tp_exp_pa_last_year,name :'x'},
      ],
      data2 : [
        { value: info.dept_exp_pa_last_year,name :'z'},
        { value: info.dept_tp_exp_pa_last_year,name :'x'},
      ],
    }
  },

  render(panel, calculations, options){
    
    // this graph will compare both the total
    // g&c spend of this department with the govenrment
    // and with the rest of the it's budget using

    if(window.is_a11y_mode){
      //all information is contained in text
      return;
    }

    const { subject, graph_args } = calculations; 
    const colors = infobase_colors();
    new charts_index.CIRCLE.circle_pie_chart( 
      panel.areas().graph.select(".x1").node(),
      {
        height : this.height,
        colors,
        formater : formats.compact1,
        font_size : "16",
        title : Subject.Gov.name,
        data : graph_args.data1,
      }
    )
      .render();

    new charts_index.CIRCLE.circle_pie_chart( 
      panel.areas().graph.select(".x2").node(),
      {
        height : this.height,
        colors,
        formater : formats.compact1,
        font_size : "16",
        title : subject.sexy_name,
        data : graph_args.data2,
      }
    )
      .render();
  },
});

