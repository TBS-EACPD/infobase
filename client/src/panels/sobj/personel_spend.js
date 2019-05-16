import { text_maker, TM } from './sobj_text_provider.js';
import {
  PanelGraph,
  years,
  businessConstants,
  util_components,
  declarative_charts,
  StdPanel,
  Col,
  NivoResponsiveLine,
} from "../shared";
const { 
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
      
      const personnel_data = () =>[{
        id: "Personnel",
        data: _.map(graph_args.series[0],
          (spending_data,year_index) =>({
            y: spending_data,
            x: calculations.info.last_years[year_index],
          })),
      }]
      
      graph_content = <div style={{height: 400}} aria-hidden = {true}>
        <NivoResponsiveLine
          raw_data = {graph_args.series[0]}
          data = {personnel_data()}
          margin = {{
            "top": 50,
            "right": 40,
            "bottom": 50,
            "left": 65,
          }}
          colors = { window.infobase_color_constants.primaryColor }
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

