import {
  formats,
  text_maker,
  PanelGraph,
  D3,
} from "../shared"; 

const total_employment_render = function(panel, data){
  if(window.is_a11y_mode){
    return;
  }
  const args={
    height: this.height,
    font_size: "16",
    font_weight: "bold",
    colors: infobase_colors(),
    formater:  d => (formats["big_int_real_raw"](d) + "\n" + text_maker("employees")),
    data: data.graph_args.vals,
    center: data.graph_args.center,
  };
  new D3.CIRCLE.circle_pie_chart(panel.areas().graph.node(),args).render();
};

new PanelGraph({
  level: "dept",
  depends_on: ['table9'],
  info_deps: [
    'table9_dept_info',
    'table9_gov_info',
  ],
  key: "last_year_total_employment",

  layout: {
    full: {text: 8, graph: 4},
    half: {text: 12, graph: 12},
  },

  height: 300,
  title: "dept_last_year_total_employment_title",
  text:  "dept_last_year_total_employment_text",

  calculate(subject,info){
    return { 
      vals: [
        {name: "gov_last_year_emp", value: info.gov_head_count_ppl_last_year},
        {name: "dept_last_year_emp", value: info.dept_head_count_ppl_last_year},
      ],
      center: true,
    };
  },

  render: total_employment_render,
});
