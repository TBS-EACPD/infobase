import { text_maker, TM } from './vote-stat-text-prodiver.js';
import { ResponsivePie } from '@nivo/pie';
import {
  formats,
  CommonDonut,
  PanelGraph,
  StdPanel,
  Col,
} from "../shared";

const render_w_options = ({graph_col, text_col, text_key}) => ({calculations,footnotes,sources}) => {
  const { 
    info,
  } = calculations;

  let stat = calculations.info.gov_stat_est_in_year;
  let vote = calculations.info.gov_voted_est_in_year;
  let keys = ["Statutory\nItem", "Voted"];
  let dataVoteStat = keys.map((d, i) =>{
    const label = d;
    const value = (i? vote: stat);
    let result = {};
    result["id"] = label;
    result["label"] = label;
    result["value"] = value;
    return result;
  })

  return (
    <StdPanel 
      title={text_maker("in_year_voted_stat_split_title")}
      {...{sources,footnotes}}
    >
      <Col isText size={text_col}>
        <TM k={text_key} args={info} />
      </Col>
      {!window.is_a11y_mode &&
        <Col isGraph size={graph_col}>
          <div style={{height: "400px"}}>
            <ResponsivePie
              data={ dataVoteStat }
              margin={{
                "top": 30,
                "right": 80,
                "bottom": 60,
                "left": 50
              }}
              innerRadius={0.5}
              colors="paired"
              colorBy="id"
              borderWidth={1}
              borderColor="inherit:darker(0.2)"
              radialLabelsSkipAngle={100}
              radialLabelsTextXOffset={6}
              startAngle={-120}
              enableSlicesLabels = {false}
              animate={true}
              motionStiffness={30}
              motionDamping={15}
              tooltipFormat={d=> `$${formats.big_int_real(d, {raw: true})}`}           
              legends={[
                {
                  "anchor": "bottom",
                  "direction": "row",
                  "translateY": 60,
                  "translateX": 50,
                  "itemWidth": 150,
                  "itemHeight": 25,
                  "itemTextColor": "#999",
                  "symbolSize": 20,
                  "font": 100,
                  "symbolShape": "circle",
                  "effects": [
                    {
                      "on": "hover",
                      "style": {
                        "itemTextColor": "#000"
                      }
                    },
                  ]
                }
              ]}
            />
          </div>
        </Col>
      }
    </StdPanel>
  );
};


new PanelGraph({
  level: "dept",
  key: 'in_year_voted_stat_split',
  depends_on: ['orgVoteStatEstimates'],
  info_deps: ['orgVoteStatEstimates_dept_info', 'orgVoteStatEstimates_gov_info' ],
  machinery_footnotes: false,
  calculate(subject,info){
    // check for negative voted or statutory values, or 0 for both
    if ( 
      info.dept_stat_est_in_year < 0 || 
      info.dept_voted_est_in_year < 0 ||
      (info.dept_stat_est_in_year === 0 && info.dept_stat_est_in_year === 0)
    ){
      return false;
    }
    return [
      {value: info.dept_stat_est_in_year, label: text_maker("stat") },
      {value: info.dept_voted_est_in_year, label: text_maker("voted") },
    ];
  },
  render: render_w_options({
    text_key: "dept_in_year_voted_stat_split_text",
    graph_col: 6,
    text_col: 6,
  }),
});

new PanelGraph({
  level: "gov",
  key: 'in_year_voted_stat_split',
  depends_on: ['orgVoteStatEstimates'],
  machinery_footnotes: false,
  info_deps: ['orgVoteStatEstimates_gov_info'],

  calculate(subject,info){
    return [
      {value: info.gov_stat_est_in_year, label: text_maker("stat") },
      {value: info.gov_voted_est_in_year, label: text_maker("voted") },
    ];
  },
  render: render_w_options({
    text_key: "gov_in_year_voted_stat_split_text",
    text_col: 7,
    graph_col: 5,
  }),
});

