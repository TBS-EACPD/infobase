import { text_maker, TM } from './sobj_text_provider.js';
import {
  dollar_formats,
  PanelGraph,
  years,
  businessConstants,
  charts_index,
  util_components,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared";
const { 
  Line,
  A11YTable,
} = declarative_charts;
const { sos } = businessConstants;
const { std_years } = years;
const { Format } = util_components;

new PanelGraph({
  level: "gov",
  depends_on: ['orgSobjs'],
  key: "personnel_spend",

  info_deps: [
    'orgSobjs_gov_info',
  ],


  calculate(subject,info,data){
    return {
      series: {
        '0': std_years.map( year => this.tables.orgSobjs.horizontal(year,false)[sos[1].text]),
      },
    };
  },

  render({calculations, footnotes, sources}){
    const {info, graph_args} = calculations;


    let graph_content;
    if(window.is_a11y_mode){
      graph_content = (
        <A11YTable
          data_col_headers={[ text_maker("spending") ]}
          data={
            _.chain(info.last_years)
              .zip(graph_args.series["0"])
              .map( ([label, amt]) => ({
                label,
                data: <Format type="compact1" content={amt} />,
              }))
              .value()
          }
        />
      );

    } else {
      graph_content = <div>
        <Line
          {...{
            series: graph_args.series,
            ticks: info.last_years,
            colors: charts_index.common_charts_utils.tbs_color(),
            add_yaxis: true,
            add_xaxis: true,
            y_axis: "($)",
            formaters: dollar_formats,
          }}

        />
      </div>;
    }

    return (
      <StdPanel
        title={text_maker("personnel_spend_title")}
        {...{footnotes,sources}}
      >
        <Col size={5} isText>
          <TM k="personnel_spend_text" args={info} />
        </Col>
        <Col size={7} isGraph>
          {graph_content}
        </Col>
      </StdPanel>
    );
  },
});

