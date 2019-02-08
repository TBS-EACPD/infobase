import { text_maker, TM } from './sobj_text_provider.js';
import { ResponsiveLine } from '@nivo/line';
import {
  formats,
  PanelGraph,
  years,
  businessConstants,
  util_components,
  declarative_charts,
  StdPanel,
  Col,
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
      let values = graph_args.series[0];
      let labels = calculations.info.last_years;
      let personnelData = values.map((d,i) =>{
        const value2 = d;
        const label2 = labels[i]; 
        let result = {}
        result["x"] = label2;
        result["y"] = value2;
        return result;
      });
      let graphData = {};
      graphData["id"] = "Personnel";
      graphData["data"] = personnelData;

      graph_content = <div style={{height: 400}}>
        <ResponsiveLine
          data={[graphData]}
          margin={{
            "top": 50,
            "right": 40,
            "bottom": 40,
            "left": 65,
          }}
          xScale={{
            "type": "point",
          }}
          yScale={{
            "type": "linear",
            "min": `${_.min(values)*.90}`,
            "max": `${_.max(values)*1.05}`,
          }}
          axisTop={null}
          axisRight={null}
          axisLeft={{
            "format": d => formats.compact1(d,{raw: true}),
            "tickValues": 5,
          }}
          dotSize={10}
          dotColor="inherit:darker(0.3)"
          enableDotLabel={false}
          dotLabel="y"
          dotLabelYOffset={-12}
          animate={true}
          colors={d3.schemeCategory10}
          motionStiffness={90}
          motionDamping={15}
          tooltipFormat={d=> <span>{`$${formats.big_int_real(d, {raw: true})}`}</span>}
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

