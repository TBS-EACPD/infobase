import './sobj-panel-text.ib.yaml';
import {
  formats,
  PanelGraph,
  years,
  business_constants,
  text_maker,
  D3,
  util_components,
} from "../shared";

const { sos } = business_constants;
const { std_years } = years;
const { Format } = util_components;

new PanelGraph({
  level: "gov",
  depends_on : ['table5'],
  key : "personnel_spend",
  info_deps: [
    'table5_gov_info',
  ],
  layout : {
    full : {text : 5, graph: 7},
    half: {text : 12, graph: 12},
  },

  title : "personnel_spend_title",
  text : "personnel_spend_text",

  calculate(subject,info,data){
    return  {
      series :  {
        '0':  std_years.map( year => this.tables.table5.horizontal(year,false)[sos[1].text]),
      },
    };
  },

  render(panel,calculations){
    const {info, graph_args} = calculations;

    if(window.is_a11y_mode){
      D3.create_a11y_table({
        container: panel.areas().graph,
        data_col_headers: [ text_maker("spending") ],
        data: _.chain(info.last_years)
          .zip(graph_args.series["0"])
          .map( ([label, amt]) => ({
            label,
            data: <Format type="compact1" content={amt} />,
          }))
          .value(),
      })


    } else {


      new D3.LINE.ordinal_line(
        panel.areas().graph.node(),
        {
          series : graph_args.series,
          ticks : info.last_years,
          colors : D3.tbs_color(),
          add_yaxis : true,
          add_xaxis : true,
          y_axis: "($)",
          formater : formats.compact1_raw,
        }
      ).render();

    }
  },
});

